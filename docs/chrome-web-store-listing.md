# Chrome Web Store Listing Draft

Use this as the source copy for the Chrome Web Store dashboard, README snippets, and launch posts.

## Title

RawLens: JSON, ANSI & Source Viewer

## Short Description

Inspect raw JSON, ANSI logs, YAML, HTML, JavaScript, CSS, and source-like text directly in Chrome.

## Detailed Description

RawLens helps developers inspect raw browser content without leaving Chrome.

It turns unreadable pages, copied logs, API responses, CI output, selected DOM text, and page source into highlighted,
formatted views. It is especially useful for raw JSON error payloads, ANSI-colored terminal output, YAML/config files,
HTML, JavaScript, CSS, Markdown, SQL, diffs, patches, and XML.

Highlights:

- Pretty-print raw JSON, including stack traces, escaped newlines, and nested JSON strings.
- Render ANSI terminal colors from CI logs, build logs, and copied command output.
- Auto-format source-like files opened directly in Chrome.
- Inspect selected text, hovered DOM nodes, clipboard content, page source, or page HTML.
- Reopen recent views from a local History panel.
- Use quick shortcuts: `vv`, `pp`, `cc`, `hh`, `xx`, `ff`, and `Esc`.
- Works locally in your browser. No server, no tracking, no log collection.

Common use cases:

- Reading API JSON responses.
- Inspecting raw GitHub/GitLab CI logs.
- Viewing copied production error logs.
- Opening YAML, JSON, JavaScript, CSS, Markdown, SQL, patch, and diff files.
- Formatting logs from a selected page element or clipboard.

RawLens is open source and MIT licensed:
https://github.com/RawLens/rawlens

## Screenshot Plan

Use screenshots that show the problem and the outcome quickly. Recommended order:

1. JSON error payload with stack trace, formatted and highlighted.
2. ANSI log with terminal colors rendered in Chrome.
3. History sidebar showing recent local inspections.
4. YAML/config file auto-formatted from a browser page.
5. Context menu or shortcut workflow.

Suggested captions:

- "Pretty-print raw JSON and error stack traces."
- "Render ANSI colors from CI and terminal logs."
- "Reopen recent local history entries without uploading content."
- "Auto-format YAML, JSON, JavaScript, CSS, Markdown, SQL, diffs, and more."
- "Use shortcuts or the context menu from any page."

## Promotional Description

A tiny Chrome extension for developers who keep opening unreadable raw content in the browser.

RawLens pretty-prints raw JSON, ANSI-colored logs, YAML, HTML, JavaScript, CSS, SQL, Markdown, diffs, and more. It works
with page source, selected text, hovered DOM nodes, clipboard content, and local browser history.

No server. No tracking. Your logs and source text stay in your browser.

## Launch Post: Short

I built RawLens, an open-source Chrome extension for inspecting raw logs and source-like text in the browser.

It pretty-prints JSON error payloads, renders ANSI colors from CI output, formats YAML/JS/CSS/HTML/Markdown/SQL/diffs,
supports shortcuts and context menu actions, and keeps a local history of recent views.

Chrome Web Store:
https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib

GitHub:
https://github.com/RawLens/rawlens

## Launch Post: Show HN / Reddit / Dev.to

I often open raw logs, API responses, or CI output in Chrome and end up copying them into a formatter just to make them
readable. I built RawLens to make that flow faster.

It is a small open-source Chrome extension that:

- Pretty-prints raw JSON, including error stack traces and escaped newlines.
- Renders ANSI terminal colors from CI/build logs.
- Auto-formats source-like pages such as YAML, JSON, JS, CSS, Markdown, SQL, patch, diff, and XML.
- Works from selection, hovered DOM node, clipboard, page source, or page HTML.
- Keeps a local history panel, stored in browser-supported IndexedDB.
- Runs locally in the browser and does not collect logs.

Chrome Web Store:
https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib

GitHub:
https://github.com/RawLens/rawlens

Feedback is welcome, especially from people who regularly inspect raw API responses or CI logs.

## Keywords To Work Naturally Into Copy

- JSON viewer
- JSON formatter
- ANSI log viewer
- Chrome log viewer
- raw content viewer
- source code viewer
- log formatter
- pretty print JSON
- raw log viewer
- CI log viewer
- YAML viewer
- developer tools

## Release Note For Version 1.4.0

RawLens is the new name for Log Viewer. This release refreshes the product branding, website, and Chrome Web Store copy
while keeping the same local JSON, ANSI, code, HTML, shortcut, and History workflows.
