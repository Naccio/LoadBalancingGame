/// <reference path='../Model/Message.ts' />
/// <reference path='../Model/MessageTransmitter.ts' />

class MessageOrchestrator {
    public messages: Message[] = [];
    public totalACKs = 0;
    public avgResponseTime = 0;

    createMessage(sender: MessageTransmitter, receiver: MessageTransmitter) {
        const m = new Message(sender, receiver);
        this.messages.push(m);
    }

    registerAck(message: Message) {
        this.totalACKs += 1;
        this.avgResponseTime = (message.life + (this.totalACKs - 1) * this.avgResponseTime) / this.totalACKs;
    }

    reset() {
        this.messages = [];
        this.totalACKs = 0;
        this.avgResponseTime = 0;
    }

    updateMessages() {
        const clientSize = Defaults.clientSize;

        for (let i = 0; i < this.messages.length; i += 1) {
            var m = this.messages[i];

            m.life += 1 / Defaults.frameRate;

            //check if connection has been dropped while message was still traveling
            if (m.status === 'req') {
                if (m.sender.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }

            if (m.status === 'ack' || m.status === 'nack') {
                if (m.receiver.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }

            //check if message has ended its journey
            if (m.status === 'done') {
                this.messages.splice(i--, 1);
                continue;
            }

            //update message
            if (m.status != 'queued') {
                const r = m.receiver,
                    mp = m.position,
                    rp = r.position;
                if (mp.x < rp.x + clientSize / 2 && mp.x > rp.x - clientSize / 2 &&
                    mp.y < rp.y + clientSize / 2 && mp.y > rp.y - clientSize / 2)
                    r.receiveMessage(m);
                else
                    m.move();
            }
        }
    }
}