/*
 * Sleep utility
 *
 * Usage:
 *   await sleep(1000) // resolves after 1 second
 *   await sleep(1000, { signal }) // can be cancelled with an AbortSignal
 */

/**
 * Pause execution for a given number of milliseconds.
 *
 * @param {number} ms - Milliseconds to sleep.
 * @param {{ signal?: AbortSignal }} [options] - Optional options object.
 * @returns {Promise<void>}
 */
export function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof ms !== 'number' || ms < 0) {
      reject(new TypeError('ms must be a non-negative number'));
      return;
    }

    if (signal && signal.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
      return;
    }

    const id = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(id);
      const err = new Error('Aborted');
      err.name = 'AbortError';
      cleanup();
      reject(err);
    }

    function cleanup() {
      if (signal) signal.removeEventListener('abort', onAbort);
    }

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}