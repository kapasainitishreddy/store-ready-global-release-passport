# IBM Bob usage log

This log records only work observed in IBM Bob. Keep individual session screenshots under `docs/hackathon/bob-screenshots/`. Codex work and the product's Bob prompt builder are separate.

| Date / team member | Task | Bob mode/features actually used | Files affected or reviewed | Result / revalidation | Screenshot filename |
| --- | --- | --- | --- | --- | --- |
| 2026-09-25 · signed-in Bob operator (add team-member name before submission) | Extend the public GitHub intake timeout through JSON body reading | Agent task; Read file; reviewed proposed diff; approved one Apply Diff | `apps/releaseproof/public/github-repository.js` | Bob moved timer cleanup into an outer `finally` and added an `AbortError` message for body reads. The file change was observed on disk and passed `node --check`; no project tests or builds were run by Bob. | `IBM-Bob-task-summary-2026-09-25.png`, `IBM-Bob-applied-diff-2026-09-25.png`; exported transcript: `IBM-Bob-public-GitHub-timeout.md` |

Before submission, label this session with the actual team member's name and obtain a separate session-summary screenshot for every other participating member. The exported transcript supplies fuller context for the screenshot. Verify that the IBM Bob Usage Statement says no more than these records support.
