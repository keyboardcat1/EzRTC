import * as signal from "./signal";
interface SignallingChannelEventMap {
    open: Event;
    error: Event;
    signal: signal.IncomingSignalEvent;
    close: CloseEvent;
}
/**
 * An abstract class representing a connection to a signalling server
 */
export declare abstract class SignallingChannel extends EventTarget {
    /**
     * Fired whenever this channel opens
     */
    onopen: (ev: Event) => any | null;
    /**
     * Fired whenever there was an error when sending data to the signaling server
     */
    onerror: (ev: Event) => any | null;
    /**
     * Fired whenever a signal has been received
     */
    onsignal: (ev: signal.IncomingSignalEvent) => any | null;
    /**
     * Fired whenever this channel closes
     */
    onclose: (ev: CloseEvent) => any | null;
    /**
     * Sends relayed data to a peer on the network
     * @param signal an {@link OutgoingSignal} to the peer in question
     */
    abstract signal(s: signal.OutgoingSignal): void;
    /**
     * Closes this channel
     */
    abstract close(): void;
    /**
     * Creates a port communicating with a single peer on this signalling network
     * @param to the peer in question
     * @returns a {@link SignallingPort} communicating with the peer in question
     */
    port(to: signal.SignallingPeerIdType): SignallingPort;
    addEventListener<K extends keyof SignallingChannelEventMap>(type: K, callback: (ev: SignallingChannelEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof SignallingChannelEventMap>(type: K, callback: (ev: SignallingChannelEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
}
interface SignallingPortEventMap {
    message: MessageEvent;
}
/**
 * A class representing a connection to a peer on a signalling network
 */
export declare class SignallingPort extends EventTarget {
    /**
     * The peer this port is communicating with
     */
    readonly to: signal.SignallingPeerIdType;
    /**
     * Fired whenever a message has been received from the peer
     */
    onmessage: (ev: MessageEvent) => any | null;
    private readonly channel;
    /**
     *
     * @param to the peer to communicate with
     * @param channel the {@link SignallingChannel} used to communicate with the peer in questoin
     */
    constructor(to: signal.SignallingPeerIdType, channel: SignallingChannel);
    /**
     * Sends a message to the peer
     * @param message any JSON stringify-able data
     */
    send(message: any): void;
    addEventListener<K extends keyof SignallingPortEventMap>(type: K, callback: (ev: SignallingPortEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof SignallingPortEventMap>(type: K, callback: (ev: SignallingPortEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
}
/**
 * A {@link SignallingChannel} to a WebSocket-based signalling server
 */
export declare class WSSignallingChannel extends SignallingChannel {
    private readonly ws;
    constructor(url: string | URL, protocols?: string | string[]);
    signal(s: signal.OutgoingSignal): void;
    close(): void;
}
export {};
