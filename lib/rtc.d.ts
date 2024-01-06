import * as signalling from "./signalling";
declare enum RTCSignalType {
    OFFER = "offer",
    ANSWER = "answer",
    CANDIDATE = "candidate"
}
/**
 * An {@link RTCPeerConnection} using a {@link SignallingPort} to exchange session descriptions and candidates
 */
export declare class SignallingRTCPeerConnection extends RTCPeerConnection {
    /**
     * The peer the port is communicating with
     */
    readonly to: signalling.SignallingPeerId;
    private readonly port;
    /**
     *
     * @param port {@link signalling.SignallingPort} to relay signalling data
     */
    constructor(port: signalling.SignallingPort, configuration?: RTCConfiguration);
}
interface SignallingRTCPeerConnectionFactoryEventMap {
    offer: OfferEvent;
}
/**
 * A class to create and configure {@link SignallingRTCPeerConnection}, but also to accept offers that aren't listened to yet.
 */
export declare class SignallingRTCPeerConnectionFactory extends EventTarget {
    /**
     * Fired whenever an offer packet has been received and is not yet listened to
     */
    onoffer: (ev: OfferEvent) => any | null;
    private readonly connections;
    private readonly channel;
    private configuration?;
    constructor(channel: signalling.SignallingChannel, configuration?: RTCConfiguration);
    /**
     * Creates and initiates a connection with a peer
     * @param to the peer in question
     * @returns a {@link SignallingRTCPeerConnection} with the peer in question
     */
    createConnection(to: signalling.SignallingPeerId): SignallingRTCPeerConnection;
    getConfiguration(): RTCConfiguration | undefined;
    setConfiguration(configuration: RTCConfiguration): void;
    addEventListener<K extends keyof SignallingRTCPeerConnectionFactoryEventMap>(type: K, callback: (ev: SignallingRTCPeerConnectionFactoryEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof SignallingRTCPeerConnectionFactoryEventMap>(type: K, callback: (ev: SignallingRTCPeerConnectionFactoryEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
}
interface IncomingOfferSignal extends signalling.IncomingSignal {
    data: {
        type: RTCSignalType.OFFER;
        body: RTCSessionDescriptionInit;
    };
}
interface OfferEventInit extends EventInit, IncomingOfferSignal {
    accept: (s: IncomingOfferSignal) => SignallingRTCPeerConnection;
}
/**An event fired whenever an offer packet has been received and is not yet listened to */
export declare class OfferEvent extends Event {
    /**
     * The peer sending this offer
     */
    readonly from: signalling.SignallingPeerId;
    constructor(type: string, eventInitDict: OfferEventInit);
    /**
     * Creates and initiates a connection with peer in question
     * @returns a {@link SignallingRTCPeerConnection} with the peer in question
     */
    readonly accept: () => SignallingRTCPeerConnection;
}
export {};
