# IBM Bob 2.0 submission checklist

**Deadline: Sunday, September 27, 2026 at 11:00 AM Eastern Time**

Record the verified release-candidate commit before submission. The parent StoreReady repository is proprietary. Keep it private; publish only the reviewed ReleaseProof additions covered by the scoped MIT notices.

## Product and code

- [x] Project title: **ReleaseProof by StoreReady**.
- [x] Short description and Problem & Solution Statement drafted in `SUBMISSION.md`; keep the long statement at or below 500 words.
- [x] Replace the IBM Bob Usage Statement with a factual account of the recorded IBM Bob session; keep it at or below 500 words.
- [x] Technology and category tags listed in `SUBMISSION.md`.
- [x] MIT license notices are scoped to the new ReleaseProof app, its demo fixtures, Bob workflow materials, and hackathon materials.
- [x] Review the exact public source bundle and confirm it contains no proprietary StoreReady implementation or private data.
- [x] Publish the scoped MIT source in a new public code repository. Do not change the existing parent repository's visibility or license.

## Working prototype

- [x] Local app starts with `node apps/releaseproof/server.mjs`.
- [x] Broken fixture shows blockers and redacted source evidence.
- [x] Workspace keeps app entries separate; apps without a scanner stay **Not audited**.
- [x] Connect a real public GitHub repository in the hosted app; confirmed 16 sampled files, an unscored report, `package.json` source evidence, two coverage gaps, and per-app result isolation on September 25.
- [x] Market plans are stored per app and locale; the searchable CLDR 48.2 catalogue provides 257 country/territory profiles and 585 locale options for Play, App Store, Galaxy Store, web SEO, and GitHub release planning. Marketplace availability remains unverified.
- [x] Locale-specific listing fields, English starter-copy generation, market review tasks, and JSON brief export work locally without sending repository data to a service. Generated search phrases are heuristic suggestions, not keyword research.
- [ ] Add native translations, current per-store rule sources, and real keyword-volume data before claiming automated localization or market compliance.
- [x] Compliance map uses manual-review and not-assessed states instead of unsupported passes.
- [x] Reviewed demo diff switches to the separate fixed fixture; the app does not modify workspace files.
- [x] Re-audit shows the repaired fixture and keeps unexecuted test/build commands at REVIEW.
- [x] JSON, Markdown, and HTML reports are available.
- [x] Root test suite: 331 passed, 0 failed; focused ReleaseProof suite: 10 passed, 0 failed.
- [x] Fixed demo fixture test and build checks passed locally.
- [x] Add the GitHub Pages workflow and scanner-derived static fixture snapshots.
- [x] Complete the latest GitHub Pages deployment (build and deploy jobs green) and verify the hosted blocked-to-ready demo flow.
- [x] Verify the public URL, 585-option locale picker, and India Hindi search in the latest hosted build.

## IBM Bob evidence

- [x] IBM Bob can access the project folder; its Agent mode read source and proposed a reviewed one-file edit.
- [x] Complete and retain at least one genuine IBM Bob code task. The public GitHub intake timeout task is logged with its exported transcript.
- [ ] If additional Bob work is claimed, run and document those exact sessions; the prepared prompts alone do not count.
- [ ] Save an authentic IBM Bob task-session summary screenshot from every participating team member in `docs/hackathon/bob-screenshots/`.
- [ ] Complete `BOB_USAGE_LOG.md` with session dates, actual modes/features used, tasks, code changes, and results.
- [x] Draft an IBM Bob Usage Statement limited to the observed Agent task and retained file change. Recheck it if additional sessions are added.

## Presentation assets

- [x] Cover image: `cover.jpg`, captured from the working StoreReady workspace with the connected blocked fixture; market capture in `market-workspace.jpg`.
- [x] Editable six-slide deck with speaker notes: `slides.pptx`.
- [ ] Record and upload a narrated video no longer than 3 minutes.
- [ ] In the video, briefly explain the problem and show the working solution on screen for at least 90 seconds.
- [ ] Show the real IBM Bob workflow and explain the actual use of Bob; do not substitute task prompts or mockups for a Bob session.
- [ ] Check narration, screen legibility, public demo and repository URLs, and total video duration before upload.

## lablab.ai final pass

- [ ] Enter title, short description, long description, IBM Bob Usage Statement, and technology/category tags.
- [ ] Attach the verified public code repository, authentic Bob session screenshots for each team member, demo platform, working public app URL, cover image, narrated video, and slide presentation.
- [ ] Confirm the public project source uses the scoped MIT notices and that any included file is authorized for public release.
- [x] Check public repository and demo URLs without GitHub authentication.
- [ ] Submit before **September 27, 2026 at 11:00 AM ET** and retain the submission confirmation.
