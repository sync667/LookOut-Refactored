# Contributing to LookOut (Refactored)

Thank you for your interest in contributing! This document provides guidelines for contributing to LookOut (Refactored).

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b my-feature`

## Development

### Prerequisites

- Node.js 20+
- npm
- Thunderbird (for manual testing)

### Project Structure

- `src/` -- Extension source code
- `src/api/` -- WebExtension Experiment APIs
- `src/modules/` -- ES6 modules (TNEF decoder, MAPI, iCal, vCard)
- `src/options/` -- Options page UI
- `src/icons/` -- Extension icons
- `src/_locales/` -- Internationalisation strings
- `tests/` -- Unit tests

### Commands

| Command | Description |
|---|---|
| `npm run lint` | Lint JS/MJS sources with ESLint |
| `npm run lint:locales` | Validate locale files |
| `npm test` | Run unit tests (Jest) |
| `npm run build` | Build `.xpi` with web-ext |

### Loading in Thunderbird

1. Open Thunderbird
2. Go to **Add-ons Manager** > **Extensions**
3. Click the gear icon > **Debug Add-ons** > **Load Temporary Add-on**
4. Select `src/manifest.json`

## Submitting Changes

1. Ensure all checks pass: `npm run lint && npm test`
2. Commit with a clear, descriptive message
3. Push to your fork and open a Pull Request against `master`
4. Describe **what** changed and **why** in the PR description

### Code Style

- Use ES6 module syntax (`import`/`export`)
- Follow the existing ESLint configuration
- Keep functions small and focused
- Add unit tests for new logic when practical

### Commit Messages

Use a short imperative subject line, e.g.:

```
fix: correct attachment index offset in TNEF decoder
feat: add support for vCard photo property
docs: update README installation steps
```

## Reporting Issues

- Check existing issues before opening a new one
- Include your OS, Thunderbird version, and LookOut version
- Provide steps to reproduce the problem
- Attach any relevant log output from the Error Console

## License

By contributing, you agree that your contributions will be licensed under the [Mozilla Public License 2.0](LICENSE).
