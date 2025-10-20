/// <reference path='GameObject.ts' />
/// <reference path='Message.ts' />

interface MessageTransmitter extends GameObject {
    connectedTo?: MessageTransmitter;
    sendMessage(elapsedTime: number): void;
    receiveMessage(message: Message): void;
}