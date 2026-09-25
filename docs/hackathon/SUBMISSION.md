# lablab.ai submission draft

Use [CHECKLIST.md](CHECKLIST.md) to finish and verify the items that still require public hosting or genuine IBM Bob session evidence.

## Project title

StoreReady: Global Release Passport

## Short description

One workspace for app-by-app security, compliance evidence, localized store listings, and country-by-country launch planning.

## Problem & Solution Statement

Small teams often ship mobile apps, SaaS products, APIs, and desktop tools across multiple countries and stores. Their release checks, listing copy, localized assets, privacy disclosures, and store policies live in separate tools. Teams lose track of which app, country, locale, or store a task belongs to, and an unchecked requirement can look like a pass.

StoreReady gives every product a separate workspace for release findings and evidence, then organizes starter market plans for Google Play, Apple App Store, Samsung Galaxy Store, web SEO, and GitHub Releases. Six starter country/locale plans hold editable listing fields, search phrase notes, visual-asset review tasks, privacy review, and store-policy evidence. The connected ReleaseProof demo runs a bounded static profile and links fixture findings to file, line, rule, scanner, and redacted evidence. Unsupported security, compliance, localization, and store coverage stays visibly unknown until a person supplies and verifies evidence. Developers can prepare a task for IBM Bob, review a genuine proposed code diff in Bob, rerun checks, and export portable reports.

The prototype does not yet connect arbitrary repositories or store accounts, fetch keyword rankings, translate or generate store assets, execute project commands, certify legal compliance, guarantee store approval, or provide legal advice. Market plans are local planning templates; results apply only to the checks and evidence shown.

## IBM Bob Usage Statement

**Not submission-ready until completed from actual IBM Bob sessions.** The current working copy does not contain evidence of an IBM Bob session, and this draft deliberately makes no claim that Bob performed the implementation.

Before submission, run the prompts in `bob/tasks/` in IBM Bob with the actual repository context. Record which Bob modes and features were used, the files Bob changed or reviewed, the task result, and the authentic session-summary screenshot for each participating team member in `docs/hackathon/BOB_USAGE_LOG.md`. Replace this note with a factual first-person or team statement describing only those sessions. Mention repository understanding, planning, specialist/subagent work, code changes, blocker remediation, documentation, or revalidation only when a screenshot or retained project diff supports the claim. Do not count Codex, scripted fixture behavior, or the task prompts themselves as IBM Bob usage.

## Technology and category tags

- **Technology:** Node.js, JavaScript, HTML, CSS, deterministic static analysis, local-first market plans, JSON, GitHub Actions
- **Category:** Developer tools, application security, release engineering, app-store optimization, localization operations

## Demo platform and working URL

- Platform: local Node.js web app served by the standalone ReleaseProof demo (`apps/releaseproof/server.mjs`)
- Local demo: `http://127.0.0.1:4173/` after `node apps/releaseproof/server.mjs`
- Public working URL: **not deployed** — enter a verified public URL before submission.

## Code repository

- Repository: `https://github.com/kapasainitishreddy/play-store-ready-vibe-coded-apps`
- Current visibility: **private**. Make public only after resolving the licensing scope and reviewing the published source.

## Cover image

The current dashboard screenshot is saved as `docs/hackathon/cover.jpg`. It is a genuine local browser capture of the blocked ReleaseProof demo fixture. `docs/hackathon/market-workspace.jpg` shows the portfolio's market-planning view. Neither image is evidence of IBM Bob usage.

## Video demo

Follow [DEMO_SCRIPT.md](DEMO_SCRIPT.md). The application walkthrough occupies about 125 seconds of the 2:50 script; narration must be recorded and the IBM Bob session must be shown authentically.

## Slide presentation

The editable six-slide presentation is [slides.pptx](slides.pptx). Its content outline and speaker notes are in [SLIDES.md](SLIDES.md).

## Business value

StoreReady reduces context switching across an app portfolio and its target markets. Teams can see which listing and asset review tasks belong to which product and locale, then keep source findings, country review, and release evidence together. The prototype includes no measured customer impact or productivity claim.

## Originality

StoreReady's point of view is a global release passport for a portfolio: each app has country-and-store launch plans, while security findings and compliance evidence stay tied to that app and unsupported checks stay unknown. The demo pairs source-linked static findings with editable market planning and a human-reviewed IBM Bob workflow. It currently has six starter locales; it does not generate translations or artwork, provide researched keyword volume, scan all companies or repositories, replace specialist scanners, or solve every security or compliance issue.

## MIT license note

The parent repository identifies itself as proprietary and `UNLICENSED`. The owner selected an MIT scope limited to new ReleaseProof additions. `apps/releaseproof/`, each self-contained demo fixture, `bob/`, and `docs/hackathon/` now contain scoped MIT license notices. The existing StoreReady source remains proprietary, so this parent repository must not be published as an MIT-licensed repository. Host the standalone MIT-scoped ReleaseProof package in a public repository before submission, and verify rights for any source links that cross into the parent project.
