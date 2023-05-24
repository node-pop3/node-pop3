export default Pop3Command;
export type Integer = number;
/**
 * @typedef {number} Integer
 */
declare class Pop3Command extends Pop3Connection {
    /**
     * @param {{
     *   user: string,
     *   password: string,
     *   host: string,
     *   port?: Integer,
     *   tls?: boolean,
     *   timeout?: Integer,
     *   tlsOptions?: import('tls').TlsOptions,
     *   servername?: string
     * }} cfg
     */
    constructor({ user, password, host, port, tls, timeout, tlsOptions, servername }: {
        user: string;
        password: string;
        host: string;
        port?: Integer;
        tls?: boolean;
        timeout?: Integer;
        tlsOptions?: import('tls').TlsOptions;
        servername?: string;
    });
    user: string;
    password: string;
    _PASSInfo: string;
    /**
     * @returns {Promise<string>}
     */
    _connect(): Promise<string>;
    /**
     * @param {Integer|string} msgNumber
     * @returns {Promise<string[][]|string[]>}
     */
    UIDL(msgNumber?: Integer | string): Promise<string[][] | string[]>;
    /**
     * @returns {Promise<void>}
     */
    NOOP(): Promise<void>;
    /**
     * @param {Integer|string} msgNumber
     * @returns {Promise<string[][]|string[]>}
     */
    LIST(msgNumber?: Integer | string): Promise<string[][] | string[]>;
    /**
     * @returns {Promise<string>}
     */
    RSET(): Promise<string>;
    /**
     * @param {Integer} msgNumber
     * @returns {Promise<string>}
     */
    RETR(msgNumber: Integer): Promise<string>;
    /**
     * @param {Integer} msgNumber
     * @returns {Promise<string>}
     */
    DELE(msgNumber: Integer): Promise<string>;
    /**
     * @returns {Promise<string>}
     */
    STAT(): Promise<string>;
    /**
     * @returns {Promise<string>}
     */
    LAST(): Promise<string>;
    /**
     * @param {Integer} msgNumber
     * @param {Integer} numLines
     * @returns {Promise<string>}
     */
    TOP(msgNumber: Integer, numLines?: Integer): Promise<string>;
    /**
     * @returns {Promise<string>}
     */
    QUIT(): Promise<string>;
}
declare namespace Pop3Command {
    export { stream2String };
    export { listify };
}
import Pop3Connection from './Connection.js';
import { stream2String } from './helper.js';
import { listify } from './helper.js';
//# sourceMappingURL=Command.d.ts.map