# StoreReady release workspace demo

This isolated Node.js app is MIT-licensed within this directory. It uses Node built-ins and reads only the bounded `examples/releaseproof/broken-app` and `fixed-app` fixtures.

## Run locally

From the repository root:

```powershell
node apps/releaseproof/server.mjs
```

Open `http://127.0.0.1:4173/`. The workspace starts with one connected local fixture and two separate, unaudited sample app entries. Use **Add app** to add app metadata in this browser, then switch between app workspaces. Newly added apps are not connected to a scanner and never receive fabricated findings. The **Markets** view stores per-app plans for six starter locales and five distribution channels, including editable listing/search drafts and launch-review tasks.

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

The **Compliance map** deliberately marks disclosure and policy requirements as manual review or not assessed. The demo does not certify compliance, scan runtime behavior, connect to external repositories, provide translated store copy, generate artwork, provide researched search volume, or claim that every security issue has been found. Unconnected apps remain **Not audited**.

The pointer-follow evidence highlight is a small original interaction informed by the motion examples on ReactBits. No ReactBits component source is copied into this MIT-scoped app; see the upstream [ReactBits project and license](https://github.com/DavidHDev/react-bits).
