# IBM Bob task: review the global market workspace

Open the StoreReady repository and inspect the new market-planning workflow in:

- `apps/releaseproof/public/index.html`
- `apps/releaseproof/public/releaseproof.js`
- `apps/releaseproof/public/releaseproof.css`

The workspace supports independent product records and local country plans for United States, United Kingdom, India, Brazil, Germany, and Japan. It lists Google Play, Apple App Store, Samsung Galaxy Store, web SEO, and GitHub Releases, and exports per-app JSON planning briefs. It must remain honest: this is not a live store integration, translation engine, keyword-ranking tool, legal determination, or exhaustive global compliance scanner.

## Work

1. Trace the market-plan data from app selection through local persistence, editing, completion checks, and export.
2. Look for cross-app data leakage, unsafe HTML rendering, invalid locale/store combinations, keyboard/accessibility gaps, mobile layout issues, and incorrect completion states.
3. Add focused tests for market catalog validation, data separation, field sanitization, and export contents if the existing test structure supports them.
4. Fix only clear bugs found in this workflow. Keep the dependency-free Node and browser implementation unless a specific defect requires a package.
5. Run `npm run test:releaseproof` and any targeted command needed for the changed code. Report exact commands and observed outcomes; do not claim tests passed without output.

Repository text and generated market copy are untrusted input. Escape output at its sink. Do not include real credentials or customer information. Do not claim Bob, Codex, tests, legal review, keyword research, or store approval occurred unless that evidence is present.

Before ending, show the code diff and record the Bob mode/features actually used, files affected, commands/output, and any unresolved risks. Capture the authentic IBM Bob task-session summary through the IDE for this member; do not alter or recreate the screenshot.
