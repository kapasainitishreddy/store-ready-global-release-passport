# IBM Bob 2.0 workflow for ReleaseProof

Use these repository-aware task prompts in IBM Bob during the hackathon. Run repository understanding first, then assign bounded specialist reviews that can run independently, and keep final integration and release decisions evidence-led. Ask Bob to show diffs and validation output; review every proposed change before accepting it.

Eight task files are prompts, not evidence of use. Record real modes/features, affected files, results, and member screenshots in `docs/hackathon/BOB_USAGE_LOG.md`. Do not claim that IBM Bob executed a task unless a team member actually used it.

Suggested order:

1. `tasks/01-repository-understanding.md`
2. Run the security, test, release, and compliance prompts as appropriate.
3. `tasks/06-fix-blockers.md` after reviewing evidence.
4. `tasks/07-final-review.md` after the final rerun.
