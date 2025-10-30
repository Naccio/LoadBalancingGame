/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='MessageTransmitter.ts' />

class Attacker implements MessageTransmitter {
    public lastMessageTime: number;
    public messagesToSend: number;
    public messagesToReceive: number;

    constructor(private orchestrator: MessageOrchestrator, public x: number, public y: number, public messages: number, public connectedTo: Server) {
        this.x = x;
        this.y = y;
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
        message.status = "done";
        this.messagesToReceive -= 1;
    };
}