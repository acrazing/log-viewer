# Security Policy

RawLens formats developer data inside Chrome, so security and privacy issues are treated seriously.

## Supported Versions

Security fixes target:

- The latest version published to the Chrome Web Store.
- The current `master` branch.

Older versions may receive fixes when the risk is high and the patch is practical, but they are not
guaranteed to be supported.

## Reporting a Vulnerability

Please do not open a public issue with exploit details, sensitive logs, tokens, or private payloads.

Preferred reporting path:

1. Use GitHub private vulnerability reporting:
   <https://github.com/RawLens/rawlens/security/advisories/new>
2. If private reporting is unavailable, open a public issue that only says you need a private security
   contact. Do not include the vulnerability details in that issue.

Helpful report details:

- RawLens version.
- Chrome version and operating system.
- Whether the issue affects selection, clipboard, page source, page HTML, raw pages, History, or the
  website.
- A minimal reproduction using redacted or synthetic data.
- Expected impact and any known workaround.

Please avoid sending real production logs, secrets, access tokens, customer data, or private URLs.

## Response Goals

These are goals, not guarantees:

- Initial acknowledgement within 7 days.
- Triage and severity assessment within 14 days.
- Coordinated fix and release plan based on severity and complexity.

## Scope

In scope:

- Chrome extension permissions and Manifest V3 behavior.
- Content script behavior and popup rendering.
- Formatting and syntax-highlighting pipelines.
- Local History storage and deduplication.
- The GitHub Pages website for RawLens.

Out of scope:

- Vulnerabilities in Chrome itself.
- Dependency vulnerabilities without a demonstrated impact on RawLens.
- Reports that require access to private user data.
- Spam, social engineering, or physical attacks.
- Denial-of-service reports against GitHub, Chrome Web Store, or other third-party services.

## Disclosure

Please give maintainers a reasonable opportunity to investigate and release a fix before public
disclosure. Credit will be given when requested and appropriate.
