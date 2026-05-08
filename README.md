<img src="src/assets/img/icon.svg" width="64"/>

# RawLens

Advanced formatting for messy JSON from anywhere in Chrome.

RawLens is a privacy-friendly Chrome extension for developers who often open unreadable raw content in the browser:
API responses, copied production logs, selected DOM text, clipboard snippets, page source, page HTML, and raw pages. It
pretty-prints nested JSON string fields like `{"foo":"{\"bar\":1}"}`, turns raw sources into highlighted readable views,
and keeps a local history so you can reopen recent inspections without sending content anywhere.

## Why Use It

- Read raw JSON error logs with stack traces, nested JSON strings, and escaped newlines.
- Pretty-print JSON from selected text, hovered page elements, clipboard content, raw pages, page source, or page HTML.
- Render ANSI terminal colors from CI logs, build logs, and copied command output.
- Auto-format source-like pages such as YAML, JSON, JavaScript, CSS, Markdown, SQL, diffs, and XML.
- Reopen recent views from the local History panel without uploading logs.
- Use quick shortcuts instead of copying raw content into a separate online formatter.

## Install

[![Chrome Extension](https://github.com/user-attachments/assets/ad7c5fd4-5b2d-4b68-b3ec-82e88d76b10e)](https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib)

Website: <https://rawlens.github.io/rawlens/>

Focused guides:

- <https://rawlens.github.io/rawlens/nested-json-string-formatter.html>
- <https://rawlens.github.io/rawlens/pretty-print-json-from-clipboard-chrome.html>
- <https://rawlens.github.io/rawlens/format-selected-json-on-page.html>

## Showcase

<details open>
<summary>Pretty JSON</summary>

![JSON View](./src/assets/img/screen-json-full.png)

</details>

<details>
<summary>ANSI Logs</summary>

![ANSI View](./src/assets/img/screen-ansi-full.png)

</details>

<details>
<summary>Local History</summary>

![History Panel](./src/assets/img/screen-yaml-full.png)

</details>

## Usage

### Shortcuts

- `vv`: Pretty-print JSON from the current selection or hovered DOM node.
- `pp`: Pretty-print JSON from the clipboard.
- `cc`: Pretty-print the current page source and auto-detect the content type.
- `hh`: Pretty-print the current page HTML.
- `xx`: Pretty-print the current page text content with ANSI colors.
- `ff`: Toggle full-screen mode.
- `Esc`: Close RawLens.

### Context Menu

RawLens adds context menu actions for JSON, ANSI, code, and HTML views. Clipboard formatting is available through the
`pp` shortcut.

### History

Every new view is saved locally in browser-supported IndexedDB storage. History entries include the time, content type,
source type, excerpt, source content, and page URL. Opening an item from History does not create another history record,
and duplicate content is automatically moved to the top with the latest time.

### Automation

RawLens automatically opens for source-like pages, such as YAML, JavaScript, CSS, JSON, Markdown, SQL, patch, and diff
resources.

Note: there is no option to disable auto-formatting yet.

## Privacy

RawLens runs locally in your browser. It does not collect, sell, transmit, or analyze your logs on a server.

## Dev

1. Clone the repo:

   ```bash
   git clone https://github.com/RawLens/rawlens.git
   ```

2. Install dependencies:

   ```bash
   yarn i
   ```

3. Start dev server:

   ```bash
   yarn start
   ```

4. Build:

   ```bash
   yarn build
   # or generate a release zip
   ./build.sh patch
   ```
