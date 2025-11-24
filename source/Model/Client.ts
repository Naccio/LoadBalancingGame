/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='MessageTransmitter.ts' />
/// <reference path='Point.ts' />

class Client implements MessageTransmitter {
    public life: number;
    public connectedTo?: Server;
    public lastMessageTime: number;
    public messagesToSend: number;
    public ACKsToReceive: number;
    public NACKsToDie: number;

    constructor(private orchestrator: MessageOrchestrator, public popularity: PopularityTracker, public position: Point, public messages: number) {
        this.life = 0;
        this.lastMessageTime = 0;
        this.messagesToSend = messages;
        this.ACKsToReceive = messages;
        this.NACKsToDie = Math.floor(messages / 3);
    }

    sendMessage(elapsedTime: number) {
        if (!this.connectedTo) {
            throw 'Disconnected client cannot send messages.';
        }

        this.orchestrator.createMessage(this, this.connectedTo);
        this.messagesToSend -= 1;
        this.lastMessageTime = elapsedTime;
    };

    receiveMessage(message: Message) {
        let n;
        if (message.status === 'ack') {
            this.ACKsToReceive -= 1;
            n = 1;
            if (this.ACKsToReceive === 0) {
                n += 5;
            }
            this.orchestrator.registerAck(message);
            this.popularity.updatePopularity(this, n);
        } else {
            this.NACKsToDie -= 1;
            n = -1;
            if (this.NACKsToDie > 0) {
                this.messagesToSend += 1;
            } else {
                n -= 5;
            }
            this.popularity.updatePopularity(this, n);
        }

        message.status = 'done';
    };
}