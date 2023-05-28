"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingSignalEvent = exports.IncomingSignalEvent = void 0;
/**
 * An event fired whenever an {@link IncomingSignal} has been received from a signalling server
 */
class IncomingSignalEvent extends Event {
    constructor(type, eventInitDict) {
        super(type, eventInitDict);
        this.from = eventInitDict.from;
        this.data = eventInitDict.data;
    }
}
exports.IncomingSignalEvent = IncomingSignalEvent;
/**
 * An event fired whenever an {@link OutgoingSignal} has been sent to a signalling server
 */
class OutgoingSignalEvent extends Event {
    constructor(type, eventInitDict) {
        super(type, eventInitDict);
        this.to = eventInitDict.to;
        this.data = eventInitDict.data;
    }
}
exports.OutgoingSignalEvent = OutgoingSignalEvent;
