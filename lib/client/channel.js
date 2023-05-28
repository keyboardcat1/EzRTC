"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSSignallingChannel = exports.SignallingPort = exports.SignallingChannel = void 0;
const signal = require("../signal");
/**
 * An abstract class representing a connection to a signalling server
 */
class SignallingChannel extends EventTarget {
    /**
     * Creates a port communicating with a single peer on this signalling network
     * @param to the peer in question
     * @returns a {@link SignallingPort} communicating with the peer in question
     */
    port(to) {
        return new SignallingPort(to, this);
    }
    addEventListener(type, callback, options) {
        super.addEventListener(type, callback, options);
    }
    removeEventListener(type, callback, options) {
        super.removeEventListener(type, callback, options);
    }
}
exports.SignallingChannel = SignallingChannel;
/**
 * A class representing a connection to a peer on a signalling network
 */
class SignallingPort extends EventTarget {
    /**
     *
     * @param to the peer to communicate with
     * @param channel the {@link SignallingChannel} used to communicate with the peer in questoin
     */
    constructor(to, channel) {
        super();
        this.to = to;
        this.channel = channel;
        this.channel.addEventListener("signal", ev => {
            if (ev.from != this.to)
                return;
            let data = ev.data;
            let event = new MessageEvent("message", { data });
            if (this.onmessage)
                this.onmessage(event);
            this.dispatchEvent(event);
        });
    }
    /**
     * Sends a message to the peer
     * @param message any JSON stringify-able data
     */
    send(message) {
        this.channel.signal({ to: this.to, data: message });
    }
    addEventListener(type, callback, options) {
        super.addEventListener(type, callback, options);
    }
    removeEventListener(type, callback, options) {
        super.removeEventListener(type, callback, options);
    }
}
exports.SignallingPort = SignallingPort;
/**
 * A {@link SignallingChannel} to a WebSocket-based signalling server
 */
class WSSignallingChannel extends SignallingChannel {
    constructor(url, protocols) {
        super();
        this.ws = new WebSocket(url, protocols);
        this.ws.addEventListener("open", ev => {
            if (this.onopen)
                this.onopen(ev);
            this.dispatchEvent(ev);
        });
        this.ws.addEventListener("error", ev => {
            if (this.onerror)
                this.onerror(ev);
            this.dispatchEvent(ev);
        });
        this.ws.addEventListener("message", ev => {
            let s = JSON.parse(ev.data);
            if (s.from && s.data) {
                let event = new signal.IncomingSignalEvent("signal", s);
                if (this.onsignal)
                    this.onsignal(event);
                this.dispatchEvent(event);
            }
        });
        this.ws.addEventListener("close", ev => {
            if (this.onclose)
                this.onclose(ev);
            this.dispatchEvent(ev);
        });
    }
    signal(s) {
        this.ws.send(JSON.stringify(s));
    }
    close() {
        this.ws.close();
    }
}
exports.WSSignallingChannel = WSSignallingChannel;
