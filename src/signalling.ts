/**
 * The type of an id of a peer on a signalling network
 */
export type SignallingPeerId = string;

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
    readonly from: SignallingPeerId;
}
/**
 * An interface representing a signal relayed to a signalling server
 */
export interface OutgoingSignal extends Signal {
    /**
     * The peer this signal will be relayed to
     */
    readonly to: SignallingPeerId;
}

interface IncomingSignalEventInit extends EventInit, IncomingSignal {
}
/**
 * An event fired whenever an {@link IncomingSignal} has been received from a signalling server
 */
export class IncomingSignalEvent extends Event implements IncomingSignal {
    readonly from: SignallingPeerId;
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
    readonly to: SignallingPeerId;
    readonly data: any;

    constructor (type: string, eventInitDict: OutgoingSignalEventInit) {
        super(type, eventInitDict);
        this.to = eventInitDict.to;
        this.data = eventInitDict.data;
    }
}


interface SignallingChannelEventMap {
    open: Event;
    error: Event
    signal: IncomingSignalEvent;
    close: CloseEvent;
}

/**
 * An abstract class representing a connection to a signalling server
 */
export abstract class SignallingChannel extends EventTarget {
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
    onsignal: (ev: IncomingSignalEvent) => any | null;
    /**
     * Fired whenever this channel closes
     */
    onclose: (ev: CloseEvent) => any | null;

    /**
     * Sends relayed data to a peer on the network
     * @param signal an {@link OutgoingSignal} to the peer in question
     */
    abstract signal(s: OutgoingSignal): void;
    /**
     * Closes this channel
     */
    abstract close(): void;

    /**
     * Creates a port communicating with a single peer on this signalling network
     * @param to the peer in question
     * @returns a {@link SignallingPort} communicating with the peer in question
     */
    port(to: SignallingPeerId): SignallingPort {
        return new SignallingPort(to, this);
    }

    addEventListener<K extends keyof SignallingChannelEventMap>(
        type: K,
        callback: (ev: SignallingChannelEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        super.addEventListener(type, callback, options);
    }

    removeEventListener<K extends keyof SignallingChannelEventMap>(
        type: K,
        callback: (ev: SignallingChannelEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        super.removeEventListener(type, callback, options);
    }   
}





interface SignallingPortEventMap {
    message: MessageEvent;
}
/**
 * A class representing a connection to a peer on a signalling network
 */
export class SignallingPort extends EventTarget {
    /**
     * The peer this port is communicating with
     */
    readonly to: SignallingPeerId;

    /**
     * Fired whenever a message has been received from the peer
     */
    onmessage: (ev: MessageEvent) => any | null;

    private readonly channel: SignallingChannel;

    /**
     * 
     * @param to the peer to communicate with
     * @param channel the {@link SignallingChannel} used to communicate with the peer in questoin 
     */
    constructor(to: SignallingPeerId, channel: SignallingChannel) {
        super();
        this.to = to;
        this.channel = channel;

        this.channel.addEventListener("signal", ev => {
            if (ev.from != this.to) return;
            let data = ev.data;
            let event = new MessageEvent("message", {data});
            if (this.onmessage) this.onmessage(event);
            this.dispatchEvent(event);
        });
    }

    /**
     * Sends a message to the peer
     * @param message any JSON stringify-able data
     */
    send(message: any): void {
        this.channel.signal({to: this.to, data: message});
    }

    addEventListener<K extends keyof SignallingPortEventMap>(
        type: K,
        callback: (ev: SignallingPortEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        super.addEventListener(type, callback, options);
    }

    removeEventListener<K extends keyof SignallingPortEventMap>(
        type: K,
        callback: (ev: SignallingPortEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        super.removeEventListener(type, callback, options);
    }
}


/**
 * A {@link SignallingChannel} to a WebSocket-based signalling server
 */
export class WSSignallingChannel extends SignallingChannel {
    private readonly ws: WebSocket;

    constructor(url: string | URL, protocols?: string | string[]) {
        super();
        this.ws = new WebSocket(url, protocols);

        this.ws.addEventListener("open", ev => {
            if (this.onopen) this.onopen(ev);
            this.dispatchEvent(ev);
        });

        this.ws.addEventListener("error", ev => {
            if (this.onerror) this.onerror(ev);
            this.dispatchEvent(ev);
        });

        this.ws.addEventListener ("message", ev => {
        let s: IncomingSignal = JSON.parse(ev.data) as IncomingSignal;
        if (s.from && s.data) {
            let event = new IncomingSignalEvent("signal", s);
            if (this.onsignal) this.onsignal(event);
            this.dispatchEvent(event);
        } 
        });

        this.ws.addEventListener("close", ev => {
            if (this.onclose) this.onclose(ev);
            this.dispatchEvent(ev);
        })
    }

    signal(s: OutgoingSignal): void {
        this.ws.send(JSON.stringify(s));
    }
    
    close(): void {
        this.ws.close();
    }
}