/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
export default Pop3Connection;
export type Integer = number;
/**
 * @typedef {number} Integer
 */
declare class Pop3Connection extends EventEmitter {
    /**
     * @param {{
    *   host: string,
    *   port?: Integer,
    *   tls?: boolean,
    *   timeout?: Integer,
    *   tlsOptions?: import('tls').TlsOptions,
    *   servername?: string
    * }} cfg
    */
    constructor({ host, port, tls, timeout, tlsOptions, servername }: {
        host: string;
        port?: Integer;
        tls?: boolean;
        timeout?: Integer;
        tlsOptions?: import('tls').TlsOptions;
        servername?: string;
    });
    host: string;
    port: number;
    tls: boolean | undefined;
    timeout: number | undefined;
    _socket: Socket | _tls.TLSSocket | null;
    _stream: Readable | null;
    tlsOptions: _tls.TlsOptions;
    servername: string;
    /**
     * @returns {Readable}
     */
    _updateStream(): Readable;
    /**
     * @param {Buffer} buffer
     * @returns {void}
     */
    _pushStream(buffer: Buffer): void;
    /**
     * @param {Error} [err]
     * @returns {void}
     */
    _endStream(err?: Error | undefined): void;
    connect(): Promise<any>;
    /**
     * @param {...(string|Integer)} args
     * @throws {Error}
     * @returns {Promise<[string, Readable]>}
     */
    command(...args: (string | Integer)[]): Promise<[string, Readable]>;
    _command: string | undefined;
}
import { EventEmitter } from 'events';
import { Socket } from 'net';
import _tls from 'tls';
import { Readable } from 'stream';
//# sourceMappingURL=Connection.d.ts.map