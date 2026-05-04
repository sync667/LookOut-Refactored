/* global AttachmentInfo */
/*
 * Author: John Bieling (john@thunderbird.net)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { ExtensionCommon } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionCommon.sys.mjs"
);
const { ExtensionUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionUtils.sys.mjs"
);
const { ExtensionError } = ExtensionUtils;

ChromeUtils.defineESModuleGetters(this, {
  AttachmentInfo: "resource:///modules/AttachmentInfo.sys.mjs",
});

Cu.importGlobalProperties(["File", "IOUtils", "PathUtils"]);

async function getRealFileForFile(file) {
  const pathTempFile = await IOUtils.createUniqueFile(
    PathUtils.tempDir,
    file.name.replaceAll(/[/:*?\"<>|]/g, "_"),
    0o600
  );

  const tempFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  tempFile.initWithPath(pathTempFile);
  const extAppLauncher = Cc[
    "@mozilla.org/uriloader/external-helper-app-service;1"
  ].getService(Ci.nsPIExternalAppLauncher);
  extAppLauncher.deleteTemporaryFileOnExit(tempFile);

  const buffer = await file.arrayBuffer();
  await IOUtils.write(pathTempFile, new Uint8Array(buffer));
  return tempFile;
}

function ClearAttachmentList(window) {
  // clear selection
  const list = window.document.getElementById("attachmentList");
  list.clearSelection();

  while (list.hasChildNodes()) {
    list.lastChild.remove();
  }
}

const Attachment = class extends ExtensionCommon.ExtensionAPI { // eslint-disable-line no-unused-vars
  getAPI(context) {

    function getMessageWindow(tabId) {
      // Get about:message from the tabId.
      const { nativeTab } = context.extension.tabManager.get(tabId);
      if (nativeTab instanceof Ci.nsIDOMWindow) {
        return nativeTab.messageBrowser.contentWindow
      } else if (nativeTab.mode && nativeTab.mode.name === "mail3PaneTab") {
        return nativeTab.chromeBrowser.contentWindow.messageBrowser.contentWindow
      } else if (nativeTab.mode && nativeTab.mode.name === "mailMessageTab") {
        return nativeTab.chromeBrowser.contentWindow;
      }
      return null;
    }

    async function getAttachmentFromUrl(url) {
      const channel = Services.io.newChannelFromURI(
        Services.io.newURI(url),
        null,
        Services.scriptSecurityManager.getSystemPrincipal(),
        null,
        Ci.nsILoadInfo.SEC_ALLOW_CROSS_ORIGIN_SEC_CONTEXT_IS_NULL,
        Ci.nsIContentPolicy.TYPE_OTHER
      );

      const raw = await new Promise((resolve, reject) => {
        const listener = Cc["@mozilla.org/network/stream-loader;1"].createInstance(
          Ci.nsIStreamLoader
        );
        listener.init({
          onStreamComplete(loader, context, status, resultLength, result) {
            if (Components.isSuccessCode(status)) {
              resolve(Uint8Array.from(result));
            } else {
              reject(
                new ExtensionError(
                  `Failed to read attachment ${url} content: ${status}`
                )
              );
            }
          },
        });
        channel.asyncOpen(listener, null);
      });

      return raw;
    }

    /**
     * Returns the currently displayed message in the given tab.
     *
     * @param {integer} tabId
     * @returns {nsIMsgHdr} nsIMsgHdr
     */
    function getDisplayedMessage(tabId) {
      const { nativeTab } = context.extension.tabManager.get(tabId);
      if (nativeTab instanceof Ci.nsIDOMWindow) {
        if (nativeTab.messageBrowser) {
          return nativeTab.messageBrowser.contentWindow.gMessage;
        }
      } else if (nativeTab.mode.name === "mail3PaneTab") {
        const msgHdrs = nativeTab.chromeBrowser.contentWindow.gDBView.getSelectedMsgHdrs();
        if (msgHdrs.length === 1) {
          return msgHdrs[0];
        }
      } else if (nativeTab.mode.name === "mailMessageTab") {
        return nativeTab.chromeBrowser.contentWindow.gMessage;
      }
      return null;
    }

    return {
      Attachment: {
        listAttachments: async function (tabId) {
          const window = getMessageWindow(tabId);
          if (!window || !window.currentAttachments) {
            return [];
          }
          const attachments = [];
          for (const attachmentInfo of window.currentAttachments) {
            const attachment = {
              contentType: attachmentInfo.contentType,
              name: attachmentInfo.name,
              partName: attachmentInfo.partID,
              size: attachmentInfo.size,
            }
            attachments.push(attachment);
          };
          return attachments;
        },
        getAttachmentFile: async function (tabId, partName) {
          const window = getMessageWindow(tabId);
          if (!window) {
            return
          }
          const attachmentInfo = window.currentAttachments.find(a => a.partID === partName);
          if (!attachmentInfo) {
            throw new ExtensionError(`Attachment with partName ${partName} not found`);
          }
          const bytes = await getAttachmentFromUrl(attachmentInfo.url);
          return new File([bytes], attachmentInfo.name, { type: attachmentInfo.contentType });
        },
        addAttachments: async function (tabId, newAttachments) {
          const window = getMessageWindow(tabId);
          if (!window) {
            return
          }

          let modified = false;
          for (const attachment of newAttachments) {
            try {
              const msgHdr = getDisplayedMessage(tabId);
              if (!msgHdr) {
                continue;
              }
              const realFile = await getRealFileForFile(attachment.file);
              const url = `${Services.io.newFileURI(realFile).spec}?part=${attachment.partName}`;
              const attachmentInfo = new AttachmentInfo({
                contentType: attachment.contentType,
                url,
                name: attachment.name,
                uri: msgHdr.folder.getUriForMsg(msgHdr),
                isExternalAttachment: true,
                message: msgHdr,
                updateAttachmentsDisplayFn: window.updateAttachmentsDisplay,
              });
              window.currentAttachments.push(attachmentInfo);
              modified = true;
            } catch (err) {
              // Tab may have been closed; skip this attachment gracefully.
              Cu.reportError(`[LookOut] addAttachments: skipping attachment "${attachment.name}" — ${err.message}`);
            }
          }

          if (!modified) {
            return
          }

          ClearAttachmentList(window);
          window.gBuildAttachmentsForCurrentMsg = false;
          await window.displayAttachmentsForExpandedView();
          window.gBuildAttachmentsForCurrentMsg = true;
        },
        removeAttachments: async function (tabId, partNames) {
          const window = getMessageWindow(tabId);
          if (!window || !window.currentAttachments) {
            return;
          }

          let modified = false;
          for (let index = window.currentAttachments.length; index > 0; index--) {
            const idx = index - 1;
            if (partNames.includes(window.currentAttachments[idx].partID)) {
              window.currentAttachments.splice(idx, 1);
              modified = true;
            }
          }

          if (!modified) {
            return
          }

          ClearAttachmentList(window);
          window.gBuildAttachmentsForCurrentMsg = false;
          await window.displayAttachmentsForExpandedView();
          window.gBuildAttachmentsForCurrentMsg = true;
        },
      },
    };
  }
};
