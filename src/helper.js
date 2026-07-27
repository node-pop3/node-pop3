import {CRLF} from './constant.js';

/**
 * @typedef {{
 *   maxBytes?: number,
 *   timeoutMs?: number
 * }|number} Stream2StringOptions
 */

/**
 * @typedef {import('stream').Stream & {
 *   destroyed?: boolean,
 *   destroy?: () => void
 * }} DestroyableStream
 */

/**
 * @param {Stream2StringOptions} [options]
 * @returns {{maxBytes: number|undefined, timeoutMs: number|undefined}}
 */
function normalizeStream2StringOptions (options) {
  if (typeof options === 'number') {
    return {
      maxBytes: Number.isFinite(options) && options > 0 ? options : undefined,
      timeoutMs: undefined
    };
  }

  if (!options) {
    return {
      maxBytes: undefined,
      timeoutMs: undefined
    };
  }

  const {maxBytes, timeoutMs} = options;

  return {
    maxBytes: typeof maxBytes === 'number' && Number.isFinite(maxBytes) &&
      maxBytes > 0
      ? maxBytes
      : undefined,
    timeoutMs: typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) &&
      timeoutMs > 0
      ? timeoutMs
      : undefined
  };
}

/**
 * @param {import('stream').Stream} stream
 * @param {Stream2StringOptions} [options]
 */
export function stream2String (stream, options) {
  const {maxBytes, timeoutMs} = normalizeStream2StringOptions(options);

  // eslint-disable-next-line promise/avoid-new -- Our own API
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];
    let length = 0;
    let settled = false;
    /** @type {ReturnType<typeof setTimeout>|undefined} */
    let streamTimeout;
    const destroyableStream = /** @type {DestroyableStream} */ (stream);

    /**
     * @returns {void}
     */
    const cleanup = () => {
      stream.removeListener('data', onData);
      stream.removeListener('error', onError);
      stream.removeListener('end', onEnd);
      clearTimeout(streamTimeout);
    };

    /**
     * @param {Error} err
     * @returns {void}
     */
    const fail = (err) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      if (
        typeof destroyableStream.destroy === 'function' &&
        !destroyableStream.destroyed
      ) {
        destroyableStream.destroy();
      }
      reject(err);
    };

    /**
     * @param {Buffer|string} chunk
     * @returns {void}
     */
    const onData = (chunk) => {
      const bufferChunk = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk);

      length += bufferChunk.length;
      if (maxBytes && length > maxBytes) {
        const err = /** @type {Error & {eventName: string}} */ (
          new Error('mailSizeExceeded')
        );
        err.eventName = 'mail-size-exceeded';
        fail(err);
        return;
      }
      chunks.push(bufferChunk);
    };

    /**
     * @param {Error} err
     * @returns {void}
     */
    const onError = (err) => {
      fail(err);
    };

    /**
     * @returns {void}
     */
    const onEnd = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      const buffer = Buffer.concat(chunks, length);

      // Reverse POP3 byte-stuffing (RFC 1939 Section 3):
      // The server prepends a '.' to any line starting with '.' to avoid
      // confusion with the multi-line terminator. The client must remove it.
      const result = dotUnstuff(buffer);
      resolve(result.toString());
    };

    stream.on('data', onData);
    stream.on('error', onError);
    stream.on('end', onEnd);

    if (timeoutMs) {
      streamTimeout = setTimeout(() => {
        const err = /** @type {Error & {eventName: string}} */ (
          new Error('stream2String timeout')
        );
        err.eventName = 'timeout';
        fail(err);
      }, timeoutMs);
    }
  });
}

/**
 * Reverse POP3 dot-stuffing (RFC 1939 Section 3).
 *
 * Any line beginning with ".." has the extra leading "." removed.
 *
 * @param {Buffer} buffer
 * @returns {Buffer}
 */
function dotUnstuff (buffer) {
  const dot = 0x2E;
  const cr = 0x0D;
  const lf = 0x0A;
  const chunks = [];
  // Check first line (no preceding CRLF)
  let start = buffer.length >= 2 && buffer[0] === dot && buffer[1] === dot
    ? 1
    : 0;

  let i = start;
  while (i <= buffer.length - 4) {
    if (
      buffer[i] === cr &&
      buffer[i + 1] === lf &&
      buffer[i + 2] === dot &&
      buffer[i + 3] === dot
    ) {
      // Include up to and including \r\n.
      chunks.push(buffer.subarray(start, i + 3));
      // Skip the extra dot
      start = i + 4;
      i = start;
    } else {
      i++;
    }
  }

  if (start === 0 && chunks.length === 0) {
    return buffer;
  }

  chunks.push(buffer.subarray(start));
  return Buffer.concat(chunks);
}

/**
 * @param {string} str
 * @returns {string[][]}
 */
export function listify (str) {
  return str.split(CRLF).
    filter(Boolean).
    map((line) => line.split(' '));
}
