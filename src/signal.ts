/**
 * The type of an id of a peer on a signalling network
 */
export type SignallingPeerIdType = string;

/**
 * An interface representing a signal relayed from or to a signalling server
 */
export interface Signal {
    /**
     * Any JSON stringify-able data
     */
    readonly data: any;
}

/**
 * An interface representing a signal relayed from a signalling server
 */
export interface IncomingSignal extends Signal {
    /**
     * The peer sending this signal
     */
    readonly from: SignallingPeerIdType;
}
/**
 * An interface representing a signal relayed to a signalling server
 */
export interface OutgoingSignal extends Signal {
    /**
     * The peer this signal will be relayed to
     */
    readonly to: SignallingPeerIdType;
}

interface IncomingSignalEventInit extends EventInit, IncomingSignal {
}
/**
 * An event fired whenever an {@link IncomingSignal} has been received from a signalling server
 */
export class IncomingSignalEvent extends Event implements IncomingSignal {
    readonly from: SignallingPeerIdType;
    readonly data: any;

    constructor (type: string, eventInitDict: IncomingSignalEventInit) {
        super(type, eventInitDict);
        this.from = eventInitDict.from;
        this.data = eventInitDict.data;
    }
}

interface OutgoingSignalEventInit extends EventInit, OutgoingSignal {
}
/**
 * An event fired whenever an {@link OutgoingSignal} has been sent to a signalling server
 */
export class OutgoingSignalEvent extends Event implements OutgoingSignal {
    readonly to: SignallingPeerIdType;
    readonly data: any;

    constructor (type: string, eventInitDict: OutgoingSignalEventInit) {
        super(type, eventInitDict);
        this.to = eventInitDict.to;
        this.data = eventInitDict.data;
    }
}