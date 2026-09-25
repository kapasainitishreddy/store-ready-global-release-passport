# StoreReady release workspace demo

The original code in this isolated Node.js app is MIT-licensed; bundled CLDR source data retains its included Unicode license. It uses Node built-ins for the fixture flow. Its browser UI can also read a bounded sample from a public GitHub repository through GitHub's API.

## Run locally

From the repository root:

```powershell
node apps/releaseproof/server.mjs
```

Open `http://127.0.0.1:4173/`. The workspace starts with one connected local fixture and two separate, unaudited sample app entries. Use **Add app** to add app metadata, then enter a public `https://github.com/owner/repo` URL on that app's overview to run a bounded scan. App results remain separate. The **Markets** view offers 257 CLDR country/territory profiles and 585 locale plans across five distribution channels; the three sample apps start with a few plans to make the workflow easy to see. Search by country, language, or locale to add another per-app plan. An optional generator drafts English listing and SEO text from an app name and editable product summary; its search phrases are heuristic ideas, not keyword research, and need human editing and native translation before use.

Regenerate the checked-in locale catalogue from the included Unicode CLDR 48.2 source data with:

```powershell
node apps/releaseproof/generate-market-catalog.mjs
```

The included CLDR files retain their separate Unicode license at `apps/releaseproof/data/cldr/LICENSE`.

Run the focused tests with:

```powershell
npm run test:releaseproof
```

Collect observed fixture metrics with:

```powershell
node apps/releaseproof/benchmark.mjs
```

## Scope and limits

The connected fixture has a deterministic static profile for source evidence and release configuration. It never executes a project's configured test, build, or start command. The repaired fixture can reach `READY` because the required configuration checks pass and it declares no third-party packages; that decision applies only to this static profile.

Public GitHub scans read at most 16 UTF-8 text files of at most 256 KiB each from the default branch. They do not execute project code, score readiness, or assess unsupported platform rules. They record sampling and other unknowns as coverage gaps; GitHub's unauthenticated API rate limit may prevent repeated scans. The **Compliance map** deliberately marks disclosure and policy requirements as manual review or not assessed. The demo does not verify marketplace availability, certify compliance, scan runtime behavior, access private repositories, provide native translations, generate artwork, provide researched search volume, or claim that every security issue has been found. CLDR languages are locale suggestions, not market demand or commercial localization research. Unconnected apps remain **Not audited**.

The pointer-follow evidence highlight is a small original interaction informed by the motion examples on ReactBits. No ReactBits component source is copied into this MIT-scoped app; see the upstream [ReactBits project and license](https://github.com/DavidHDev/react-bits).
