import * as signalling from "./signalling";

enum RTCSignalType {
    OFFER = "offer",
    ANSWER = "answer",
    CANDIDATE = "candidate",
}
type RTCSignallingData = {
    type: RTCSignalType;
    body: RTCSessionDescriptionInit | RTCIceCandidate | null;
}



/**
 * An {@link RTCPeerConnection} using a {@link SignallingPort} to exchange session descriptions and candidates
 */
export class SignallingRTCPeerConnection extends RTCPeerConnection {
    /**
     * The peer the port is communicating with
     */
    readonly to: signalling.SignallingPeerId;

    private readonly port: signalling.SignallingPort;

    /**
     * 
     * @param port {@link signalling.SignallingPort} to relay signalling data
     */
    constructor(port: signalling.SignallingPort, configuration?: RTCConfiguration) {
        super(configuration);
        this.to = port.to;
        this.port = port;

        this.port.addEventListener("message", ev => {
            try {
                let data: RTCSignallingData = JSON.parse(ev.data) as RTCSignallingData;
                switch (data.type) {
                    case RTCSignalType.OFFER:
                        this.setRemoteDescription(data.body as RTCSessionDescriptionInit);
                        this.createAnswer().then(answer => {
                            let response: RTCSignallingData = {type: RTCSignalType.ANSWER, body: answer};
                            this.port.send(response);
                        });
                        break;
                    case RTCSignalType.ANSWER:
                        this.setRemoteDescription(data.body as RTCSessionDescriptionInit);
                        break;
                    case RTCSignalType.CANDIDATE:
                        this.addIceCandidate(data.body as RTCIceCandidate);
                        break;
                } 
            } catch (e) {}
        });

        super.addEventListener("icecandidate", ev => {
            let response: RTCSignallingData = {type: RTCSignalType.CANDIDATE, body: ev.candidate};
            this.port.send(response);
        });


        super.createOffer().then(offer => {
            this.setLocalDescription(offer);
            let response: RTCSignallingData = {type: RTCSignalType.OFFER, body: offer};
            this.port.send(response);
        });
    }
}


interface SignallingRTCPeerConnectionFactoryEventMap {
    offer: OfferEvent;
}

/**
 * A class to create and configure {@link SignallingRTCPeerConnection}, but also to accept offers that aren't listened to yet.
 */
export class SignallingRTCPeerConnectionFactory extends EventTarget {
    /**
     * Fired whenever an offer packet has been received and is not yet listened to 
     */
    onoffer: (ev: OfferEvent) => any | null;

    private readonly connections: {[to: signalling.SignallingPeerId]: SignallingRTCPeerConnection} = {};
    private readonly channel: signalling.SignallingChannel;
    private configuration?: RTCConfiguration;

    constructor(channel: signalling.SignallingChannel, configuration?: RTCConfiguration) {
        super();
        this.channel = channel;
        this.configuration = configuration;

        this.channel.addEventListener("signal", ev => {
            let data = ev.data as RTCSignallingData;
            if ((ev.from in this.connections) || data.type != RTCSignalType.OFFER) return;

            let accept: (s: IncomingOfferSignal) => SignallingRTCPeerConnection = (s) => {
                let connection = new SignallingRTCPeerConnection(this.channel.port(ev.from), this.configuration);
                let event = new signalling.IncomingSignalEvent("signal", {from: s.from, data: s.data});
                this.connections[ev.from] = connection;
                this.channel.dispatchEvent(event);
                return connection;
            }
            let event = new OfferEvent("offer", {from: ev.from, data: ev.data, accept});
            if (this.onoffer) this.onoffer(event);
            this.dispatchEvent(event); 
        });
    }

    /**
     * Creates and initiates a connection with a peer
     * @param to the peer in question
     * @returns a {@link SignallingRTCPeerConnection} with the peer in question
     */
    createConnection(to: signalling.SignallingPeerId): SignallingRTCPeerConnection {
        let connection = new SignallingRTCPeerConnection(this.channel.port(to), this.configuration);
        connection.addEventListener("iceconnectionstatechange", () => {
            if (connection.iceConnectionState === "disconnected") delete this.connections[connection.to];
        })
        return connection;
    }

    getConfiguration(): RTCConfiguration | undefined {
        return this.configuration;
    }

    setConfiguration(configuration: RTCConfiguration): void {
        this.configuration = configuration;
    }

    addEventListener<K extends keyof SignallingRTCPeerConnectionFactoryEventMap>(
        type: K,
        callback: (ev: SignallingRTCPeerConnectionFactoryEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        super.addEventListener(type, callback, options);
    }

    removeEventListener<K extends keyof SignallingRTCPeerConnectionFactoryEventMap>(
        type: K,
        callback: (ev: SignallingRTCPeerConnectionFactoryEventMap[K]) => any,
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


interface IncomingOfferSignal extends signalling.IncomingSignal {
    data: {type: RTCSignalType.OFFER, body: RTCSessionDescriptionInit};
}
interface OfferEventInit extends EventInit, IncomingOfferSignal {
    accept: (s: IncomingOfferSignal) => SignallingRTCPeerConnection;
}
/**An event fired whenever an offer packet has been received and is not yet listened to */
export class OfferEvent extends Event {
    /**
     * The peer sending this offer
     */
    readonly from: signalling.SignallingPeerId;
    
    constructor(type: string, eventInitDict: OfferEventInit) {
        super(type, eventInitDict);
        this.from = eventInitDict.from;
        this.accept = () => eventInitDict.accept({from: eventInitDict.from, data: eventInitDict.data});
    }

    /**
     * Creates and initiates a connection with peer in question
     * @returns a {@link SignallingRTCPeerConnection} with the peer in question
     */
    readonly accept: () => SignallingRTCPeerConnection;
}
