# Contributing

Thanks for helping improve RawLens. The best contributions keep the extension fast, local-first, and
focused on developer inspection workflows.

## Good First Contributions

- Reproducible bug reports for formatting, source detection, History, or popup behavior.
- Small parser or content-type improvements.
- Better examples for messy JSON, nested JSON strings, logs, or source-like files.
- Website and README improvements.
- Focused fixes with tests or clear manual verification notes.

## Before You Start

For larger changes, open an issue first so the approach can be discussed. Small bug fixes, docs updates,
and typo fixes can go straight to a pull request.

Do not include real production logs, secrets, tokens, customer data, or private URLs in issues, tests,
screenshots, or pull requests.

## Development Setup

```bash
git clone https://github.com/RawLens/rawlens.git
cd rawlens
yarn install
yarn start
```

The dev server writes extension files to `build`. In Chrome, open `chrome://extensions`, enable
Developer mode, choose **Load unpacked**, and select the `build` directory.

Reload the extension after rebuilds.

## Useful Commands

```bash
yarn tsc --noEmit
yarn build
yarn build:site
./node_modules/.bin/prettier --check README.md
```

The project uses Yarn 1.x and recommends Node.js 24.

## Pull Request Guidelines

- Keep pull requests focused on one problem.
- Follow the existing TypeScript and CSS style.
- Preserve local-first behavior. RawLens should not upload inspected content to a server.
- Avoid broad refactors unless they directly support the change.
- Include manual verification steps in the PR description.
- Update README, website copy, or screenshots when user-facing behavior changes.
- Do not commit generated `build` or `dist-site` output.

## Release Notes

Maintainers create Chrome Web Store release zips with:

```bash
./build.sh patch
```

The release script expects a clean worktree, bumps the version, commits, tags, builds, and writes the zip
to `~/Downloads`.
