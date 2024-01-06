"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCHTMLMediaStream = exports.RTCMediaStream = void 0;
/**
 * A utility abstraction over a `MediaStream` and a `RTCPeerConnection` linked and automatically configured to ouput to this stream
 */
class RTCMediaStream extends MediaStream {
    constructor(connection, streamtracks) {
        super(streamtracks);
        this._connection = connection;
        this.configureConnection();
    }
    get connection() {
        return this._connection;
    }
    set connection(connection) {
        this._connection = connection;
        this.configureConnection();
    }
    configureConnection() {
        if (this._connection)
            this._connection.addEventListener("track", ev => this.addTrack(ev.track));
    }
}
exports.RTCMediaStream = RTCMediaStream;
/**
 * A utility abstraction over a `MediaStream`, a `RTCPeerConnection` and a HTML media element linked and automatically configured
 */
class RTCHTMLMediaStream extends MediaStream {
    constructor(connection, element, streamtracks) {
        super(streamtracks);
        this._connection = connection;
        this.configureConnection();
        this._element = element;
        this.configureElement();
    }
    get connection() {
        return this._connection;
    }
    set connection(connection) {
        this._connection = connection;
        this.configureConnection();
    }
    configureConnection() {
        if (this._connection)
            this._connection.addEventListener("track", ev => {
                this.addTrack(ev.track);
            });
    }
    get element() {
        return this._element;
    }
    set element(element) {
        this._element = element;
        this.configureElement();
    }
    configureElement() {
        if (this._element)
            this._element.srcObject = this;
    }
}
exports.RTCHTMLMediaStream = RTCHTMLMediaStream;
