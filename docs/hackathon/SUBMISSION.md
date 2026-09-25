# lablab.ai submission draft

Use the submission-package checklist and `docs/hackathon/CHECKLIST.md` in the public repository to track the remaining lablab.ai account and team-evidence steps. The public demo, source repository, Bob session evidence, video, and slides are prepared.

## Project title

StoreReady: Global Release Passport

## Short description

One workspace for app-by-app security, compliance evidence, localized store listings, and country-by-country launch planning.

## Problem & Solution Statement

Small teams often ship mobile apps, SaaS products, APIs, and desktop tools across multiple countries and stores. Their release checks, listing copy, localized assets, privacy disclosures, and store policies live in separate tools. Teams lose track of which app, country, locale, or store a task belongs to, and an unchecked requirement can look like a pass.

StoreReady gives every product a separate workspace for release findings and evidence, then organizes country-and-locale plans for Google Play, Apple App Store, Samsung Galaxy Store, web SEO, and GitHub Releases. Its searchable catalogue contains 257 CLDR country/territory profiles and 585 locale suggestions; each app has separate editable listing fields, search phrases, visual-asset tasks, privacy review, and store-policy evidence per locale. An optional generator drafts English listing and SEO copy from an app name and editable product summary; its suggested search phrases are heuristic, not researched. Drafts remain human-editable and require native translation and market review. The connected ReleaseProof demo runs a bounded static profile and links fixture findings to file, line, rule, scanner, and redacted evidence. A separate browser flow samples up to 16 small UTF-8 files from a public GitHub repository's default branch and runs a narrower, unscored static profile. Unsupported security, compliance, localization, and store coverage stays visibly unknown until a person supplies and verifies evidence. Developers can prepare a task for IBM Bob, review a genuine proposed code diff in Bob, rerun checks, and export portable reports.

The prototype does not scan private repositories or complete codebases, connect store accounts, verify actual store availability, fetch keyword rankings, generate native translations or store artwork, execute project commands, certify legal compliance, guarantee store approval, or provide legal advice. CLDR languages are locale suggestions, not evidence of demand or translation coverage. Market plans are local templates; results apply only to the checks and evidence shown.

## IBM Bob Usage Statement

IBM Bob's Agent mode was used in the open StoreReady repository for a scoped public-repository intake fix. Bob read `apps/releaseproof/public/github-repository.js`, identified that the 12-second request timer ended when response headers arrived, proposed a one-file diff, and explained how a slow JSON body could remain unbounded. The operator reviewed and approved that diff once. Bob moved timer cleanup to an outer `finally` that covers both the request and JSON body read, and added a specific timeout message for an aborted body read. Bob's completed-task screenshot and exported session transcript are retained in `docs/hackathon/bob-screenshots/`. The edited file was checked for JavaScript syntax after the Bob session. Bob did not run project tests or a build for this task. This fix improves one failure path in the bounded public scan; it does not provide full repository security or compliance coverage.

**Before submission:** Attribute this session to the signed-in team member in `BOB_USAGE_LOG.md` and retain a separate authentic session-summary screenshot from every other participating member. Add further Bob work only when an actual recorded session supports it. Codex work, the product's Bob prompt builder, and the scripted fixture switch are not IBM Bob usage.

## Technology and category tags

- **Technology:** Node.js, JavaScript, HTML, CSS, GitHub REST API, deterministic static analysis, local-first market plans, JSON, GitHub Actions
- **Category:** Developer tools, application security, release engineering, app-store optimization, localization operations

## Demo platform and working URL

- Platform: GitHub Pages static demo; local Node.js app served by the standalone ReleaseProof demo (`apps/releaseproof/server.mjs`)
- Local demo: `http://127.0.0.1:4173/` after `node apps/releaseproof/server.mjs`
- Public working URL: `https://kapasainitishreddy.github.io/store-ready-global-release-passport/`. The hosted fixture audit replays generated fixture-result JSON snapshots; public GitHub scans run live in the browser. Verify the final deployment after its workflow completes.

## Code repository

- Repository: `https://github.com/kapasainitishreddy/store-ready-global-release-passport` (public, standalone scoped package).
- The proprietary StoreReady parent repository remains private and is not included.

## Cover image

The current dashboard screenshot is saved as `docs/hackathon/cover.jpg`. It is a genuine local browser capture of the blocked ReleaseProof demo fixture. `docs/hackathon/market-workspace.jpg` shows the portfolio's market-planning view. Neither image is evidence of IBM Bob usage.

## Video demo

The finished [2:58 demo video](https://github.com/kapasainitishreddy/store-ready-global-release-passport/blob/main/docs/hackathon/ReleaseProof-IBM-Bob-Demo.mp4) contains 158 seconds of real application footage, generated spoken narration, and captions. The final section shows the authentic IBM Bob session and reviewed one-file diff. The [recorded-demo script](https://github.com/kapasainitishreddy/store-ready-global-release-passport/blob/main/docs/hackathon/DEMO_SCRIPT.md) documents the timeline and limitations. Re-record with a team member if the organizers require human narration.

## Slide presentation

The editable six-slide presentation is [slides.pptx](slides.pptx). Its content outline and speaker notes are in [SLIDES.md](SLIDES.md).

## Business value

StoreReady reduces context switching across an app portfolio and its target markets. Teams can see which listing and asset review tasks belong to which product and locale, then keep source findings, country review, and release evidence together. The prototype includes no measured customer impact or productivity claim.

## Originality

StoreReady's point of view is a global release passport for a portfolio: each app has country-and-store launch plans, while security findings and compliance evidence stay tied to that app and unsupported checks stay unknown. The demo pairs source-linked static findings, a bounded public GitHub scan, searchable CLDR-backed locale plans, and an English starter-copy generator. It does not generate native translations or artwork, verify actual store availability, provide researched keyword volume, inspect private or complete repositories, replace specialist scanners, or solve every security or compliance issue.

## MIT license note

The parent repository identifies itself as proprietary and `UNLICENSED`. The owner selected an MIT scope limited to new ReleaseProof additions. Original code in `apps/releaseproof/`, the self-contained demo fixtures, Bob prompts, and contributor-created hackathon writing have scoped MIT license notices. CLDR data retains its included Unicode license, and the authentic IBM Bob UI screenshot is retained as evidence under the rights described in `THIRD_PARTY_NOTICES.md`. Existing proprietary StoreReady source is excluded from the public repository.
