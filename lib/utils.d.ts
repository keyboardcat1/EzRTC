/**
 * A utility abstraction over a `MediaStream` and a `RTCPeerConnection` linked and automatically configured to ouput to this stream
 */
export declare class RTCMediaStream extends MediaStream {
    private _connection;
    constructor(connection: RTCPeerConnection);
    constructor(connection: RTCPeerConnection, stream: MediaStream);
    constructor(connection: RTCPeerConnection, tracks: MediaStreamTrack[]);
    get connection(): RTCPeerConnection;
    set connection(connection: RTCPeerConnection);
    private configureConnection;
}
/**
 * A utility abstraction over a `MediaStream`, a `RTCPeerConnection` and a HTML media element linked and automatically configured
 */
export declare class RTCHTMLMediaStream extends MediaStream {
    private _connection;
    private _element;
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement);
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement, stream: MediaStream);
    constructor(connection: RTCPeerConnection, element: HTMLMediaElement, tracks: MediaStreamTrack[]);
    get connection(): RTCPeerConnection;
    set connection(connection: RTCPeerConnection);
    private configureConnection;
    get element(): HTMLMediaElement;
    set element(element: HTMLMediaElement);
    private configureElement;
}
