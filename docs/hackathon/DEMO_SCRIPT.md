# StoreReady narrated demo script (2:50)

Target runtime: **2:50**. Keep the live app visible for at least 125 seconds. Show real IBM Bob only after a genuine session has been captured; until then, leave the Bob portion as a clearly labeled recording placeholder. Start with `node apps/releaseproof/server.mjs`.

| Time | Visual / action | Narration |
| --- | --- | --- |
| 0:00–0:18 | Presenter and StoreReady overview | “A small team may run a SaaS app, an Android app, and an API in several countries. Security findings, store copy, localized assets, and market rules end up scattered across tools.” |
| 0:18–0:38 | Show app portfolio; open PocketLedger and Beacon API | “StoreReady keeps each product separate. An app without a scanner stays Not audited and never inherits another product’s results.” |
| 0:38–1:08 | Open **Markets**; select PocketLedger; show United States, India, and Japan plans; inspect Play, Galaxy, web, and GitHub surfaces | “Each app can have its own country launch plan. For an Android app I can track the Play and Galaxy listings, localized search fields, assets, privacy review, and the GitHub or web release materials.” |
| 1:08–1:23 | Fill one listing field, check a completed task, export the JSON brief | “The locale draft and checklist are stored separately for this app. The export carries the fields and remaining review work; it does not publish or claim search-volume results.” |
| 1:23–1:45 | Return to ReleaseProof; run audit; show blocked score and 5 findings | “The connected sample is a deliberately broken local fixture. Its bounded static profile finds two blockers and three warnings with source-linked evidence. It does not run project commands.” |
| 1:45–2:00 | Open Security, inspect redacted credential finding | “A credential-shaped value is redacted and linked to its file, line, and rule so a developer can verify it before acting.” |
| 2:00–2:12 | Open Compliance map and show manual review / not assessed | “Store policies and local obligations change. Unsupported checks stay manual or unknown; this prototype never presents a compliance certification.” |
| 2:12–2:38 | Show actual IBM Bob session in repository; explain prompt, Bob analysis, actual diff, human review, and verified tests | “I used IBM Bob on this real issue. Here is the session and the diff it proposed. I reviewed the change and checked the actual verification output before re-running StoreReady.” |
| 2:38–2:50 | Re-audit and show result, final dashboard | “Now the same profile shows what changed and what still needs human review. StoreReady keeps each app’s global release work and evidence in one place.” |

**Recording gate:** Do not record the quoted Bob narration until it describes a genuine session. Open the working copy in IBM Bob, run a scoped task in `bob/tasks/08-global-market-readiness.md` or `bob/tasks/02-security-audit.md`, review and accept an actual diff, run the relevant command, and capture an authentic task-session summary screenshot. Keep a screenshot from each team member. The scripted fixture switch is sample data and never counts as Bob use.
