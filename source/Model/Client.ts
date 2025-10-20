/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='MessageTransmitter.ts' />

class Client implements MessageTransmitter {
    public life: number;
    public connectedTo?: Server;
    public lastMessageTime: number;
    public messagesToSend: number;
    public acksToReceive: number;
    public nacksToDie: number;

    constructor(private orchestrator: MessageOrchestrator, public popularity: PopularityTracker, public x: number, public y: number, public msgNr: number) {
        this.x = x;
        this.y = y;
        this.life = 0;
        this.lastMessageTime = 0;
        this.messagesToSend = msgNr;
        this.acksToReceive = msgNr;
        this.nacksToDie = Math.floor(msgNr / 3);
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
        if (message.status === "ack") {
            this.acksToReceive -= 1;
            n = 1;
            if (this.acksToReceive === 0) {
                n += 5;
            }
            this.orchestrator.registerAck(message);
            this.popularity.updatePopularity(n, this.x, this.y);
        } else {
            this.nacksToDie -= 1;
            n = -1;
            if (this.nacksToDie > 0) {
                this.messagesToSend += 1;
            } else {
                n -= 5;
            }
            this.popularity.updatePopularity(n, this.x, this.y);
        }

        message.status = "done";
    };
}