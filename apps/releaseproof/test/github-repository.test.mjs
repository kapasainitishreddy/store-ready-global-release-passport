import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicGitHubRepository } from '../public/github-repository.js';

test('public GitHub request deadline stays active while parsing the response body', async () => {
  const nativeSetTimeout = globalThis.setTimeout;
  const nativeClearTimeout = globalThis.clearTimeout;
  const timerHandle = Symbol('mock GitHub request timeout');
  let requestDeadline;

  globalThis.setTimeout = (callback, delay, ...args) => {
    if (delay === 12_000) {
      requestDeadline = callback;
      return timerHandle;
    }
    return nativeSetTimeout(callback, delay, ...args);
  };
  globalThis.clearTimeout = handle => {
    if (handle === timerHandle) requestDeadline = undefined;
    else nativeClearTimeout(handle);
  };

  try {
    const fetchImpl = async (_url, { signal }) => ({
      status: 200,
      ok: true,
      headers: { get: () => null },
      json: () => {
        assert.equal(typeof requestDeadline, 'function', 'deadline must remain active after response headers arrive');
        const body = new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            const error = new Error('The response body was aborted.');
            error.name = 'AbortError';
            reject(error);
          }, { once: true });
        });
        requestDeadline();
        return body;
      }
    });

    await assert.rejects(
      loadPublicGitHubRepository('https://github.com/example/repository', { fetchImpl }),
      /GitHub did not respond within 12 seconds\./
    );
  } finally {
    globalThis.setTimeout = nativeSetTimeout;
    globalThis.clearTimeout = nativeClearTimeout;
  }
});
