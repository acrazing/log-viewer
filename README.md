<p align="center">
  <img src="src/assets/img/icon.svg" width="96" alt="RawLens logo" />
</p>

<h1 align="center">RawLens</h1>

<p align="center">
  <strong>Advanced formatting for messy JSON from anywhere in Chrome.</strong>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib">
    <img alt="Chrome Web Store" src="https://img.shields.io/chrome-web-store/v/lbnkfmnolbefifdccejjijdgdipnfaib?label=Chrome%20Web%20Store" />
  </a>
  <a href="https://github.com/RawLens/rawlens/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://rawlens.github.io/rawlens/">
    <img alt="Website" src="https://img.shields.io/badge/website-rawlens.github.io-1f6feb" />
  </a>
</p>

RawLens is an open-source Chrome extension for developers who inspect raw API responses, production
logs, webhook payloads, copied debug output, selected DOM text, page source, and source-like files in
the browser.

Its core feature is **pretty-printing messy JSON from anywhere**, including JSON string fields that
contain escaped nested JSON:

```json
{ "foo": "{\"bar\":1}" }
```

RawLens expands those JSON-looking string values into readable structured data, then renders the result
in a local, syntax-highlighted popup with collapsible lines, history, and quick keyboard workflows.

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib)
or visit the [project website](https://rawlens.github.io/rawlens/).

## Why RawLens

Most browser JSON tools assume you are opening a clean JSON endpoint. Real debugging data is messier:
nested payloads are escaped into strings, errors include stack traces, logs are copied from dashboards,
and the interesting object is often inside a selected page element instead of a raw response.

RawLens is designed for those moments.

| Need                                   | RawLens workflow                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Pretty-print nested JSON string fields | Open a JSON response, select text, hover an element, or use the clipboard shortcut. |
| Inspect JSON from any page             | Use `vv` for the current selection or hovered DOM node.                             |
| Format copied logs or payloads         | Copy content and press `pp`.                                                        |
| Read raw files in Chrome               | RawLens auto-opens for source-like content types and extensions.                    |
| Review recent inspections              | Use the local History panel backed by IndexedDB.                                    |
| Keep sensitive logs private            | Formatting and history run locally in the browser.                                  |

## Highlights

- **Nested JSON string formatting**: detects and formats escaped JSON stored inside string fields.
- **JSON from anywhere**: supports selected text, hovered DOM nodes, clipboard content, raw pages,
  page source, and page HTML.
- **Source-aware formatting**: formats supported source types with Biome or Prettier and highlights
  with Shiki.
- **ANSI log rendering**: turns CI output, terminal logs, and copied command output into readable
  colored text.
- **Local history**: stores recent inspections in browser-supported IndexedDB with dedupe and delete
  support.
- **Fast popup workflow**: keyboard shortcuts, context menu actions, collapsible lines, full-screen
  toggle, and a hideable history sidebar.
- **Privacy-first**: no hosted formatter, no server-side processing, no inspected-content upload.

## Screenshots

### Messy JSON

![RawLens JSON viewer screenshot](./src/assets/img/screen-json-full.png)

### ANSI Logs

![RawLens ANSI log screenshot](./src/assets/img/screen-ansi-full.png)

### Local History

![RawLens history panel screenshot](./src/assets/img/screen-yaml-full.png)

## Installation

### Chrome Web Store

Install RawLens from the
[Chrome Web Store](https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib).

### From Source

```bash
git clone https://github.com/RawLens/rawlens.git
cd rawlens
yarn install
yarn build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the
generated `build` directory.

## Usage

RawLens can open automatically on source-like pages, from the context menu, or through two-key shortcuts.
Shortcuts are ignored while typing in inputs, textareas, and editable content.

| Shortcut | Action                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------- |
| `vv`     | Pretty-print JSON from the current selection, or from the hovered DOM node when nothing is selected. |
| `pp`     | Pretty-print JSON from clipboard text.                                                               |
| `cc`     | Format the current page source and auto-detect the content type.                                     |
| `hh`     | Format the current page HTML.                                                                        |
| `xx`     | Render the current page text as ANSI-colored output.                                                 |
| `ff`     | Toggle full-screen mode.                                                                             |
| `Esc`    | Close the RawLens popup.                                                                             |

RawLens also adds right-click context menu actions for JSON, ANSI, code, and HTML views.

## Supported Inputs

| Source          | Description                                                                    |
| --------------- | ------------------------------------------------------------------------------ |
| Raw page        | API responses, raw files, logs, or source-like text opened directly in Chrome. |
| Selection       | The selected text on any web page.                                             |
| Hovered element | The text content of the element under the cursor when there is no selection.   |
| Clipboard       | Copied JSON, logs, stack traces, or debug payloads.                            |
| Page source     | The fetched source text for the current page.                                  |
| Page HTML       | The current document HTML.                                                     |
| History         | A previous local inspection reopened from the sidebar.                         |

## Supported Formats

RawLens focuses on messy JSON, but also handles common developer text formats:

- JSON and nested JSON string fields.
- JavaScript, TypeScript, JSX, TSX, CSS, SCSS, Less, HTML, XML, Vue, YAML, Markdown, MDX, and GraphQL.
- ANSI-colored terminal output.
- Source-like pages such as SQL, patches, and diffs are highlighted when opened as text.

Formatting is best-effort. If a parser cannot format the content, RawLens still shows the original text
with a visible error message when available.

## History

History records are stored locally in IndexedDB. Each record includes:

- Time.
- Content type.
- Source type.
- Excerpt.
- Source content.
- Page URL.

When the same content is saved again, RawLens deduplicates it and moves the existing record to the top
with the latest time. Reopening an item from History does not create a new record.

## Architecture

RawLens is a Manifest V3 Chrome extension.

- The content script captures selections, hovered elements, clipboard text, page HTML, and popup UI
  interactions.
- The background service worker performs formatting and highlighting.
- Biome WASM formats JSON, JavaScript, TypeScript, CSS, and GraphQL where supported.
- Prettier handles additional parser-backed formats.
- Shiki renders syntax-highlighted HTML.
- `ansi-html` renders ANSI terminal colors.
- IndexedDB stores local history and review-prompt state.

## Development

Requirements:

- Node.js 24 is recommended.
- Yarn 1.x is used by the project lockfile.

Install dependencies:

```bash
yarn install
```

Start the development build server:

```bash
yarn start
```

The dev server writes extension files to `build`. Load that directory from `chrome://extensions`, then
reload the extension after rebuilds.

Run checks and builds:

```bash
yarn tsc --noEmit
yarn build
yarn build:site
```

Create a release zip for the Chrome Web Store:

```bash
./build.sh patch
```

The release script expects a clean worktree. It bumps the version, commits, tags, builds the extension,
and writes a zip file to `~/Downloads`.

## Website

The static website lives in `site` and is built into `dist-site`:

```bash
yarn build:site
```

GitHub Actions deploys the site to GitHub Pages on pushes to `master`.

Useful pages:

- [Nested JSON string formatter](https://rawlens.github.io/rawlens/nested-json-string-formatter.html)
- [Pretty print JSON from clipboard in Chrome](https://rawlens.github.io/rawlens/pretty-print-json-from-clipboard-chrome.html)
- [Format selected JSON on any page](https://rawlens.github.io/rawlens/format-selected-json-on-page.html)

## Privacy

RawLens runs locally in Chrome. Inspected content is formatted in the extension and stored only in local
browser storage when it is saved to History. RawLens does not send logs, payloads, or clipboard content
to a hosted formatter or analytics service.

## Project Policies

- [Security policy](./SECURITY.md)
- [Contributing guide](./CONTRIBUTING.md)
- [Support policy](./SUPPORT.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)

## Contributing

Issues, bug reports, and focused pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md)
for setup steps, pull request guidelines, and release notes.

The most useful reports include:

- The input source you used, such as selection, clipboard, raw page, page source, or history.
- The content type or file extension.
- A small redacted sample that reproduces the formatting issue.
- The RawLens version and Chrome version.

## License

RawLens is released under the [MIT License](./LICENSE).
