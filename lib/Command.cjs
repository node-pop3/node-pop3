import Pop3Connection from "./Connection.cjs";
import { stream2String, listify } from "./helper.cjs";

/**
 * @typedef {number} Integer
 */

/**
 *
 */
class Pop3Command extends Pop3Connection {
  /**
   * @param {{
   *   user: string,
   *   password: string,
   *   host: string,
   *   port?: Integer,
   *   tls?: boolean,
   *   timeout?: Integer,
   *   maxMailSize?: Integer,
   *   parseStreamToString?: boolean,
   *   streamReadTimeout?: Integer,
   *   tlsOptions?: import('tls').TlsOptions,
   *   servername?: string
   * }} cfg
   */
  constructor({
    user,
    password,
    host,
    port,
    tls,
    timeout,
    maxMailSize,
    parseStreamToString = true,
    streamReadTimeout,
    tlsOptions,
    servername
  }) {
    super({
      host,
      port,
      tls,
      timeout,
      tlsOptions,
      servername
    });
    this.user = user;
    this.password = password;
    this.maxMailSize = maxMailSize;
    this.parseStreamToString = parseStreamToString;
    this.streamReadTimeout = streamReadTimeout;
    this._PASSInfo = '';
  }

  /**
   * @param {import('stream').Stream} stream
   * @returns {Promise<string>|import('stream').Stream}
   */
  _parseMailStream(stream) {
    if (this.parseStreamToString === false) {
      return stream;
    }
    return stream2String(stream, {
      maxBytes: this.maxMailSize,
      timeoutMs: this.streamReadTimeout
    });
  }

  /**
   * @returns {Promise<string>}
   */
  async _connect() {
    if (this._socket) {
      return this._PASSInfo;
    }
    await super.connect();
    await super.command('USER', this.user);
    const [info] = await super.command('PASS', this.password);
    this._PASSInfo = info;
    return this._PASSInfo;
  }

  /**
   * @param {Integer|string} msgNumber
   * @returns {Promise<string[][]|string[]>}
   */
  async UIDL(msgNumber = '') {
    await this._connect();
    const [info, stream] = await super.command('UIDL', msgNumber);
    if (msgNumber) {
      return listify(info)[0];
    }
    const str = await stream2String(/** @type {import('stream').Stream} */stream);
    return listify(str);
  }

  /**
   * @returns {Promise<void>}
   */
  async NOOP() {
    await this._connect();
    await super.command('NOOP');
  }

  /**
   * @param {Integer|string} msgNumber
   * @returns {Promise<string[][]|string[]>}
   */
  async LIST(msgNumber = '') {
    await this._connect();
    const [info, stream] = await super.command('LIST', msgNumber);
    if (msgNumber) {
      return listify(info)[0];
    }
    const str = await stream2String(/** @type {import('stream').Stream} */stream);
    return listify(str);
  }

  /**
   * @returns {Promise<string>}
   */
  async RSET() {
    await this._connect();
    const [info] = await super.command('RSET');
    return info;
  }

  /**
   * @param {Integer} msgNumber
   * @returns {Promise<string|import('stream').Stream>}
   */
  async RETR(msgNumber) {
    await this._connect();
    const [, stream] = await super.command('RETR', msgNumber);
    return this._parseMailStream(/** @type {import('stream').Stream} */stream);
  }

  /**
   * @param {Integer} msgNumber
   * @returns {Promise<string>}
   */
  async DELE(msgNumber) {
    await this._connect();
    const [info] = await super.command('DELE', msgNumber);
    return info;
  }

  /**
   * @returns {Promise<string>}
   */
  async STAT() {
    await this._connect();
    const [info] = await super.command('STAT');
    return info;
  }

  /**
   * @returns {Promise<string>}
   */
  async LAST() {
    await this._connect();
    try {
      const [info] = await super.command('LAST');
      return info;
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' && /(?:last command not enabled)/ui.test(err.message)) {
        return err.message;
      }
      throw err;
    }
  }

  /**
   * @param {Integer} msgNumber
   * @param {Integer} numLines
   * @returns {Promise<string|import('stream').Stream>}
   */
  async TOP(msgNumber, numLines = 0) {
    await this._connect();
    const [, stream] = await super.command('TOP', msgNumber, numLines);
    return this._parseMailStream(/** @type {import('stream').Stream} */stream);
  }

  /**
   * @returns {Promise<string>}
   */
  async QUIT() {
    if (!this._socket) {
      this._PASSInfo = 'Bye';
      return this._PASSInfo;
    }
    const [info] = await super.command('QUIT');
    this._PASSInfo = info || '';
    return this._PASSInfo;
  }
}
Pop3Command.stream2String = stream2String;
Pop3Command.listify = listify;
export default Pop3Command;
//# sourceMappingURL=Command.cjs.map