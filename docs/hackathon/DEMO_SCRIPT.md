# StoreReady: Global Release Passport — recorded demo

**Final runtime:** 2:58 (178 seconds). The video contains 158 seconds of real product footage and interaction, followed by a 20-second Bob-session close. Captions are burned in and also provided as a separate `.srt` file. Narration uses the built-in Microsoft Zira speech voice.

| Time | What appears | Narration focus |
| --- | --- | --- |
| 0:00–0:40 | ReleaseProof fixture, security and compliance views, app portfolio, StoreReady public demo | Multiple products, separated workspaces, redacted finding, human review, and the rule that unscanned apps stay unaudited. |
| 0:40–1:22 | Bounded public GitHub scan result and source evidence | Up to 16 small public text files, unscored output, coverage gaps, no code execution, and API limits. |
| 1:22–2:02 | PocketLedger market planning; India Hindi (`hi-IN`), locale suggestions, store-channel applicability, English starter draft | Localized plans are per app; copy needs human/native-language review; store availability is not verified. |
| 2:02–2:18 | English starter copy and sample broken-to-fixed fixture replay | Search phrases are suggestions. Fixture replay is separate from a source-code change. |
| 2:18–2:58 | Actual IBM Bob session result and applied one-file diff, held on screen for the closing explanation | Bob Agent assisted with a timeout fix in the public GitHub intake. The 12-second deadline now covers JSON-body reading. The diff was reviewed and applied; JavaScript syntax was checked afterward. Bob did not run tests, and this change is not a complete security or compliance audit. |

## Submission notes

- The captured product footage uses the hosted demo and real browser interactions. It includes more than the required 90 seconds of working application.
- Narration is synthetic speech, not a human voice recording. Re-record it with a team member if the event requires human narration.
- The IBM Bob Agent task-summary screenshot and applied-diff screenshot are included in the repository evidence. The transcript records Bob's scope and limitations.
- The demo uses ReleaseProof's public sample repository because the team's own product repository has not yet been selected.
- This video does not show every feature or prove that all global regulations, store policies, or security concerns are solved.
