"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignallingServer = void 0;
/**
 * @WIP
 */
class SignallingServer {
    constructor(send) {
        this.send = send;
    }
    receive(from, s) {
        let _s = { from, data: s.data };
        this.send(s.to, _s);
    }
}
exports.SignallingServer = SignallingServer;
