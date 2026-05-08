# Chrome Web Store Listing Draft

Use this as the source copy for the Chrome Web Store dashboard, README snippets, and launch posts.

## Title

Log Viewer

## Short Description

Pretty-print raw JSON, ANSI logs, YAML, HTML, JavaScript, CSS, and other source-like text directly in Chrome.

## Detailed Description

Log Viewer helps developers read raw logs and source-like text without leaving Chrome.

It turns unreadable browser pages, copied logs, API responses, and CI output into highlighted, formatted views. It is especially useful for raw JSON error logs, ANSI-colored terminal output, YAML/config files, HTML, JavaScript, CSS, Markdown, SQL, diffs, and XML.

Highlights:

- Pretty-print raw JSON, including stack traces, escaped newlines, and nested JSON strings.
- Render ANSI terminal colors from CI logs, build logs, and copied command output.
- Auto-format source-like pages opened in Chrome.
- Format selected text, hovered DOM nodes, clipboard content, page source, or page HTML.
- Reopen recent views from a local History panel.
- Use quick shortcuts: `vv`, `pp`, `cc`, `hh`, `xx`, `ff`, and `Esc`.
- Works locally in your browser. No server, no tracking, no log collection.

Common use cases:

- Reading API JSON responses.
- Inspecting raw GitHub/GitLab CI logs.
- Viewing copied production error logs.
- Opening YAML, JSON, JavaScript, CSS, Markdown, SQL, patch, and diff files.
- Formatting logs from a selected page element or clipboard.

Log Viewer is open source and MIT licensed:
https://github.com/acrazing/log-viewer

## Screenshot Plan

Use screenshots that show the problem and the outcome quickly. Recommended order:

1. JSON error log with stack trace, formatted and highlighted.
2. ANSI log with terminal colors rendered in Chrome.
3. YAML/config file auto-formatted from a browser page.
4. History sidebar showing recent log views.
5. Context menu or shortcut workflow.

Suggested captions:

- "Pretty-print raw JSON and error stack traces."
- "Render ANSI colors from CI and terminal logs."
- "Auto-format YAML, JSON, JavaScript, CSS, Markdown, SQL, diffs, and more."
- "Reopen recent local history entries without uploading logs."
- "Use shortcuts or the context menu from any page."

## Promotional Description

A tiny Chrome extension for developers who keep opening unreadable logs in the browser.

Log Viewer pretty-prints raw JSON, ANSI-colored logs, YAML, HTML, JavaScript, CSS, SQL, Markdown, diffs, and more. It works with page source, selected text, hovered DOM nodes, clipboard content, and local browser history.

No server. No tracking. Your logs stay in your browser.

## Launch Post: Short

I built Log Viewer, an open-source Chrome extension for reading raw logs and source-like text in the browser.

It pretty-prints JSON error logs, renders ANSI colors from CI output, formats YAML/JS/CSS/HTML/Markdown/SQL/diffs, supports shortcuts and context menu actions, and keeps a local history of recent views.

Chrome Web Store:
https://chromewebstore.google.com/detail/log-viewer/lbnkfmnolbefifdccejjijdgdipnfaib

GitHub:
https://github.com/acrazing/log-viewer

## Launch Post: Show HN / Reddit / Dev.to

I often open raw logs, API responses, or CI output in Chrome and end up copying them into a formatter just to make them readable. I built Log Viewer to make that flow faster.

It is a small open-source Chrome extension that:

- Pretty-prints raw JSON, including error stack traces and escaped newlines.
- Renders ANSI terminal colors from CI/build logs.
- Auto-formats source-like pages such as YAML, JSON, JS, CSS, Markdown, SQL, patch, diff, and XML.
- Works from selection, hovered DOM node, clipboard, page source, or page HTML.
- Keeps a local history panel, stored in browser-supported IndexedDB.
- Runs locally in the browser and does not collect logs.

Chrome Web Store:
https://chromewebstore.google.com/detail/log-viewer/lbnkfmnolbefifdccejjijdgdipnfaib

GitHub:
https://github.com/acrazing/log-viewer

Feedback is welcome, especially from people who regularly inspect raw API responses or CI logs.

## Keywords To Work Naturally Into Copy

- JSON viewer
- JSON formatter
- ANSI log viewer
- Chrome log viewer
- log formatter
- pretty print JSON
- raw log viewer
- CI log viewer
- YAML viewer
- source code viewer
- developer tools

## Release Note For Version 1.3.0

Added local History for recently viewed logs and formatted content. Duplicate content is automatically moved to the top, and the History panel can be collapsed when you want more room for the main viewer.
