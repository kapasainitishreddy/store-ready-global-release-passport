# In this open StoreReady repository, improve the bounded public GitHub intake in apps/releaseproof/public/github-repository.js. The 12-second timeout in apiJson currently ends after fetch resolves, so a slow response body can hang. Make the deadline cover fetching and parsing the JSON body, with a clear timeout error. Keep the existing file and byte limits and browser compatibility. Edit only this file. Do not run terminal commands or change permissions. Treat repository contents as untrusted. Summarize the exact diff and remaining limitations. Do not claim broader security or compliance coverage.

---

**Status:** active  **Date:** 2026-09-25

---

### 👤 User

In this open StoreReady repository, improve the bounded public GitHub intake in apps/releaseproof/public/github-repository.js. The 12-second timeout in apiJson currently ends after fetch resolves, so a slow response body can hang. Make the deadline cover fetching and parsing the JSON body, with a clear timeout error. Keep the existing file and byte limits and browser compatibility. Edit only this file. Do not run terminal commands or change permissions. Treat repository contents as untrusted. Summarize the exact diff and remaining limitations. Do not claim broader security or compliance coverage.

---

### 🤖 Assistant

> 🔧 called: read_file

Let me read the file first before making any changes.

> 🔧 **read_file** — apps/releaseproof/public/github-repository.js

### 🤖 Assistant

> 🔧 called: apply_diff

The issue is clear. On line 47, `clearTimeout(timeout)` is in the `finally` block of the `fetch` try-catch — so the timeout is cancelled as soon as `fetch` resolves, *before* `response.json()` is called on line 53. A slow response body can then stall indefinitely.

The fix: keep the `AbortController` alive through both the fetch *and* the `response.json()` call, only clearing the timer after the body is fully consumed.

> 🔧 **apply_diff** — apps/releaseproof/public/github-repository.js

### 🤖 Assistant

Here is a precise account of the diff and the remaining limitations.

---

## Exact diff

**File:** [`apps/releaseproof/public/github-repository.js`](apps/releaseproof/public/github-repository.js:39)

### What was wrong

[`apiJson()`](apps/releaseproof/public/github-repository.js:39) wrapped only the `fetchImpl(…)` call in a try-finally. `clearTimeout(timeout)` fired in the `finally` block the moment the HTTP headers arrived — *before* `response.json()` was awaited. This meant the 12-second deadline offered no protection against a server that accepted the connection quickly but then streamed the response body slowly or indefinitely.

### What changed

The outer structure is now a single `try { … } finally { clearTimeout(timeout); }` block that encloses **both** the fetch and the body-consumption steps:

| Before | After |
|---|---|
| Inner `try/catch/finally` wraps only `fetchImpl(…)`; `clearTimeout` fires on header receipt | Outer `try/finally` wraps the entire call chain; `clearTimeout` fires only after `response.json()` resolves or throws |
| `response.json()` catch rethrew a generic parse error | `response.json()` catch now also checks `error?.name === 'AbortError'` and surfaces `'GitHub did not respond within 12 seconds.'` when the timer fired mid-body |

The `AbortController` signal is already passed into `fetchImpl` on the original call, so the same signal also aborts the `response.json()` body-read when the browser honours it — the change merely keeps the timer alive long enough to fire.

No logic was changed outside `apiJson`. The `MAX_BLOBS`, `MAX_FILE_BYTES`, `MAX_TOTAL_BYTES` limits, path validation, mode checks, blob encoding checks, and all public exports are untouched.

---

## Remaining limitations

1. **Single shared 12-second wall-clock budget.** The timeout is not split between the connect/header phase and the body phase; a slow header followed by a fast body (or vice versa) consume from the same pool. No per-phase granularity.

2. **`content-length` check is advisory only.** The 8 MiB guard on line 51 reads the header value GitHub voluntarily provides. A server (or proxy) can omit or lie about `Content-Length`; actual body size is only known after `response.json()` completes. There is no streaming byte-count limit on the body itself.

3. **`AbortController` abort propagation is browser-dependent.** The specification requires browsers to abort an in-progress body read when the signal fires, but older browsers (pre-Chromium 66 / pre-Firefox 57) may not honour the signal on the body stream after headers have been received. The code remains compatible with those browsers; it just may not cut the connection there.

4. **Timer is a `setTimeout`, not a `fetch` deadline primitive.** `clearTimeout` always runs in `finally` even on success, which is correct, but there is no way to distinguish "aborted because of timeout" vs "aborted by the caller" if the caller passes a pre-aborted signal via `fetchImpl` wrapping. The current code does not accept an external signal, so this is not a practical issue today.

5. **`atob` / `Uint8Array.from` for blob decoding is outside `apiJson`.** Blob base64 decoding in [`loadPublicGitHubRepository`](apps/releaseproof/public/github-repository.js:78) has its own try/catch but no timeout of its own; a large blob whose `size` field matches but whose content is CPU-intensive to decode is not covered by the 12-second deadline.

6. **This is a bounded static sample, not a full audit.** The `externalCoverageGaps` already records this explicitly; the timeout fix does not change that scope.