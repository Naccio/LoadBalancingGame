/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='MessageTransmitter.ts' />
/// <reference path='Point.ts' />

class Attacker implements MessageTransmitter {
    public lastMessageTime: number;
    public messagesToSend: number;
    public messagesToReceive: number;

    constructor(private orchestrator: MessageOrchestrator, public position: Point, public messages: number, public connectedTo: Server) {
        this.connectedTo = connectedTo;
        this.lastMessageTime = 0;
        this.messagesToSend = messages;
        this.messagesToReceive = messages;
    }

    sendMessage(elapsedTime: number) {
        this.orchestrator.createMessage(this, this.connectedTo);
        this.messagesToSend -= 1;
        this.lastMessageTime = elapsedTime;
    };

    receiveMessage(message: Message) {
        message.status = 'done';
        this.messagesToReceive -= 1;
    };
}