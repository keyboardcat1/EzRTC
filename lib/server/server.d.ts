import * as signal from "../signal";
/**
 * @WIP
 */
export declare class SignallingServer {
    send: (to: signal.SignallingPeerIdType, s: signal.IncomingSignal) => void;
    constructor(send: (to: signal.SignallingPeerIdType, s: signal.IncomingSignal) => void);
    receive(from: signal.SignallingPeerIdType, s: signal.OutgoingSignal): void;
}
