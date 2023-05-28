import * as signal from "../signal";

/**
 * @WIP
 */
export class SignallingServer {
    send: (to: signal.SignallingPeerIdType, s: signal.IncomingSignal) => void;

    constructor(send: (to: signal.SignallingPeerIdType, s: signal.IncomingSignal) => void) {
        this.send = send;
    }

    receive(from: signal.SignallingPeerIdType, s: signal.OutgoingSignal): void {
        let _s: signal.IncomingSignal = {from, data: s.data};
        this.send(s.to, _s);
    }   
}