/**
 * A utility abstraction over a `MediaStream` and a `RTCPeerConnection` linked and automatically configured to ouput to this stream
 */
export class RTCMediaStream extends MediaStream {
    private _connection: RTCPeerConnection;

    constructor(connection: RTCPeerConnection)
    constructor(connection: RTCPeerConnection, stream: MediaStream)
    constructor(connection: RTCPeerConnection, tracks: MediaStreamTrack[])
    constructor(connection: RTCPeerConnection, streamtracks?: any) {
        super(streamtracks);
        this._connection = connection;
        this.configureConnection();
    }

    get connection() {
        return this._connection;
    }
    set connection(connection: RTCPeerConnection) {
        this._connection = connection;
        this.configureConnection();
    }

    private configureConnection() {
        if (this._connection) 
            this._connection.addEventListener("track", ev => this.addTrack(ev.track));
    }
}

/**
 * A utility abstraction over a `MediaStream`, a `RTCPeerConnection` and a HTML media element linked and automatically configured
 */
export class RTCHTMLMediaStream extends MediaStream {
    private _connection: RTCPeerConnection;
    private _element: HTMLMediaElement;

    constructor(connection: RTCPeerConnection, element: HTMLMediaElement)
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement, stream: MediaStream)
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement, tracks: MediaStreamTrack[])
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement, streamtracks?: any) {
        super(streamtracks);
        this._connection = connection;
        this.configureConnection();
        this._element = element;
        this.configureElement();
    }

    get connection() {
        return this._connection;
    }
    set connection(connection: RTCPeerConnection) {
        this._connection = connection;
        this.configureConnection();
    }
    private configureConnection() {
        if (this._connection) 
            this._connection.addEventListener("track", ev => {
                this.addTrack(ev.track);
            });
    }

    get element() {
        return this._element;
    }
    set element(element: HTMLMediaElement) {
        this._element = element;
        this.configureElement();
    }
    private configureElement() {
        if (this._element) this._element.srcObject = this;
    }
}