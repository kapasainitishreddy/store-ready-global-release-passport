<!-- SPDX-License-Identifier: MIT; see docs/hackathon/LICENSE for this file's license. -->

# StoreReady: Global Release Passport

**One app portfolio. Every market launch. Evidence before release.**

StoreReady is a local-first release workspace for teams shipping multiple apps in multiple markets. The hackathon prototype is isolated and MIT-scoped beside the existing proprietary StoreReady product, which remains unchanged.

## Problem

Small SaaS teams track several products, countries, and distribution channels at once. Security findings, compliance evidence, store copy, local SEO, artwork, and store-specific policy checks live in separate tools. Missing or unlocalized work is easy to overlook, and generic readiness scores hide exactly what remains.

## Solution

StoreReady gives each app a separate workspace for security and release evidence, plus country-by-country plans for Google Play, Apple App Store, Samsung Galaxy Store, web SEO, and GitHub Releases. Each plan stores locale-specific listing fields, search phrases, localized asset and privacy tasks, and a human-reviewed readiness checklist. A connected ReleaseProof demo reads one bounded local fixture and produces deterministic findings with file/rule/scanner evidence and explicit coverage gaps. Other apps stay **Not audited** until a scanner is connected. Its Bob handoff is designed for a real evidence-linked repository task and reviewed diff.

This demo does not connect arbitrary repositories or store accounts, execute project scripts, fetch keyword rankings, translate copy, generate localized art, assess every jurisdiction, certify compliance, guarantee store approval, or publish an app. Market plans are local templates; unsupported scanner and policy coverage stays manual review or not assessed.

## How IBM Bob 2.0 is used

The repository includes focused task prompts for understanding the project, auditing security/testing/release/compliance, reviewing the global-market workflow, fixing reviewed blockers, and performing final verification. A developer can open the repository in IBM Bob, run one scoped task at a time, review Bob's proposed diff, run the relevant checks, and record the actual results and session-summary screenshots.

The current working copy contains no IBM Bob session evidence. The task prompts and usage log are workflow materials; they are not proof that Bob ran. Update [the usage log](docs/hackathon/BOB_USAGE_LOG.md) from real sessions before submission. Never add fabricated screenshots or claim tasks that were not performed.

## Architecture

```mermaid
flowchart LR
  Developer["Developer"] --> UI["ReleaseProof dashboard"]
  UI --> DemoAPI["Loopback demo API"]
  DemoAPI --> Fixture["Broken or fixed sample files"]
  Fixture --> Engine["Deterministic bounded static checks"]
  Engine --> Evidence["Checks, findings, coverage gaps"]
  Evidence --> Gate["Explainable release decision"]
  Gate --> Reports["JSON, Markdown, HTML evidence"]
  Evidence --> BobPrompt["Reviewed task prompt for IBM Bob"]
  BobPrompt --> Bob["Developer runs IBM Bob separately"]
  Bob --> Review["Human diff review and revalidation"]
```

Country plans are isolated by app and stored in browser local storage. The built-in market catalog provides six starter locales. Listing and search fields are editable planning drafts; this prototype does not generate translations or artwork, provide researched keyword volumes, or claim exhaustive country coverage.

The demo API only accepts a fixture selector (`broken` or `fixed`). It does not accept arbitrary paths or execute sample code. Existing StoreReady ZIP scanning retains its path validation, file/count/expansion limits, loopback-only development server, and security headers.

## Repeatable demo

From the repository root, run:

```powershell
node apps/releaseproof/server.mjs
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). The dashboard audits `examples/releaseproof/broken-app`. Open **Markets** to review per-app country plans, fill locale-specific fields, mark reviewed launch evidence, and export a JSON brief. App-store and compliance tasks remain human-reviewed. Only the connected fixture runs source checks. Select **Prepare fix with IBM Bob** to create a prompt for a real Bob session. The fixture switch is sample data, not a code edit or Bob usage.

Run the measured fixture benchmark with:

```powershell
node apps/releaseproof/benchmark.mjs
```

The benchmark prints the actual check count, fixture file count, blocker counts, and local audit durations for that run. It makes no speed or productivity claim.

## Existing StoreReady workflow

The root package remains StoreReady v2. The existing CLI, Android/store assurance engine, evidence normalization, bounded worker/service architecture, runtime lab, and report generation remain in place. Useful commands include:

```powershell
npm test
npm run test:releaseproof
npm run verify
npm run release:gate
npm run scan:demo
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [autonomous assurance](docs/AUTONOMOUS_ASSURANCE.md), and [security](SECURITY.md) for the existing product model.

## Security limits

The ReleaseProof demo audit reads only the checked-in sample fixture. It enforces limits on file count, per-file size, total source size, and repository path syntax. Credential-shaped source evidence is redacted. It never shells out or imports files from the scanned fixture. Static checks can miss issues and produce false positives. Remote dependency advisory coverage is explicitly unavailable for fixtures with dependencies.

## Hackathon submission readiness

- **Demo platform:** GitHub Pages static demo plus the standalone local Node.js app in `apps/releaseproof/`.
- **Working local URL:** `http://127.0.0.1:4173/` while `node apps/releaseproof/server.mjs` is running.
- **Public working URL:** https://kapasainitishreddy.github.io/store-ready-global-release-passport/ (GitHub Pages deployment verified; hosted audit uses scanner-derived fixture snapshots).
- **Public code repository:** https://github.com/kapasainitishreddy/store-ready-global-release-passport (standalone MIT-scoped package).
- **License:** the parent StoreReady repository is proprietary (`UNLICENSED`). The isolated ReleaseProof app, sample fixtures, Bob prompts, and hackathon documents have scoped MIT notices. The parent repository itself must remain private unless its rights and license are separately resolved.
- **IBM Bob screenshots:** not present. Capture authentic session summaries using the steps in [the screenshot guide](docs/hackathon/bob-screenshots/README.md).
- **Cover image:** a real local browser capture of the blocked audit is saved as `docs/hackathon/cover.jpg`; `docs/hackathon/market-workspace.jpg` shows the country planning view.
- **Final checklist:** [docs/hackathon/CHECKLIST.md](docs/hackathon/CHECKLIST.md) marks completed local items and the external items still due.
- **Video and slides:** scripts are in [DEMO_SCRIPT.md](docs/hackathon/DEMO_SCRIPT.md) and [SLIDES.md](docs/hackathon/SLIDES.md); recording and visual slide production remain manual.

## Hackathon

IBM Bob 2.0 Hackathon · September 25–27, 2026 · submission deadline September 27, 2026 at 11:00 AM ET.

This project is a local prototype of per-app, per-market release operations, not an exhaustive security/compliance service or store-approval guarantee.
