"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferEvent = exports.SignallingRTCPeerConnectionFactory = exports.SignallingRTCPeerConnection = void 0;
const signalling = require("./signalling");
var RTCSignalType;
(function (RTCSignalType) {
    RTCSignalType["OFFER"] = "offer";
    RTCSignalType["ANSWER"] = "answer";
    RTCSignalType["CANDIDATE"] = "candidate";
})(RTCSignalType || (RTCSignalType = {}));
/**
 * An {@link RTCPeerConnection} using a {@link SignallingPort} to exchange session descriptions and candidates
 */
class SignallingRTCPeerConnection extends RTCPeerConnection {
    /**
     *
     * @param port {@link signalling.SignallingPort} to relay signalling data
     */
    constructor(port, configuration) {
        super(configuration);
        this.to = port.to;
        this.port = port;
        this.port.addEventListener("message", ev => {
            try {
                let data = JSON.parse(ev.data);
                switch (data.type) {
                    case RTCSignalType.OFFER:
                        this.setRemoteDescription(data.body);
                        this.createAnswer().then(answer => {
                            let response = { type: RTCSignalType.ANSWER, body: answer };
                            this.port.send(response);
                        });
                        break;
                    case RTCSignalType.ANSWER:
                        this.setRemoteDescription(data.body);
                        break;
                    case RTCSignalType.CANDIDATE:
                        this.addIceCandidate(data.body);
                        break;
                }
            }
            catch (e) { }
        });
        super.addEventListener("icecandidate", ev => {
            let response = { type: RTCSignalType.CANDIDATE, body: ev.candidate };
            this.port.send(response);
        });
        super.createOffer().then(offer => {
            this.setLocalDescription(offer);
            let response = { type: RTCSignalType.OFFER, body: offer };
            this.port.send(response);
        });
    }
}
exports.SignallingRTCPeerConnection = SignallingRTCPeerConnection;
/**
 * A class to create and configure {@link SignallingRTCPeerConnection}, but also to accept offers that aren't listened to yet.
 */
class SignallingRTCPeerConnectionFactory extends EventTarget {
    constructor(channel, configuration) {
        super();
        this.connections = {};
        this.channel = channel;
        this.configuration = configuration;
        this.channel.addEventListener("signal", ev => {
            let data = ev.data;
            if ((ev.from in this.connections) || data.type != RTCSignalType.OFFER)
                return;
            let accept = (s) => {
                let connection = new SignallingRTCPeerConnection(this.channel.port(ev.from), this.configuration);
                let event = new signalling.IncomingSignalEvent("signal", { from: s.from, data: s.data });
                this.connections[ev.from] = connection;
                this.channel.dispatchEvent(event);
                return connection;
            };
            let event = new OfferEvent("offer", { from: ev.from, data: ev.data, accept });
            if (this.onoffer)
                this.onoffer(event);
            this.dispatchEvent(event);
        });
    }
    /**
     * Creates and initiates a connection with a peer
     * @param to the peer in question
     * @returns a {@link SignallingRTCPeerConnection} with the peer in question
     */
    createConnection(to) {
        let connection = new SignallingRTCPeerConnection(this.channel.port(to), this.configuration);
        connection.addEventListener("iceconnectionstatechange", () => {
            if (connection.iceConnectionState === "disconnected")
                delete this.connections[connection.to];
        });
        return connection;
    }
    getConfiguration() {
        return this.configuration;
    }
    setConfiguration(configuration) {
        this.configuration = configuration;
    }
    addEventListener(type, callback, options) {
        super.addEventListener(type, callback, options);
    }
    removeEventListener(type, callback, options) {
        super.removeEventListener(type, callback, options);
    }
}
exports.SignallingRTCPeerConnectionFactory = SignallingRTCPeerConnectionFactory;
/**An event fired whenever an offer packet has been received and is not yet listened to */
class OfferEvent extends Event {
    constructor(type, eventInitDict) {
        super(type, eventInitDict);
        this.from = eventInitDict.from;
        this.accept = () => eventInitDict.accept({ from: eventInitDict.from, data: eventInitDict.data });
    }
}
exports.OfferEvent = OfferEvent;
