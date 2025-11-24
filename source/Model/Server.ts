/// <reference path='MessageTransmitter.ts' />
/// <reference path='Point.ts' />

class Server implements MessageTransmitter {
    public queue: Message[];
    public lastMessageTime: number;
    public capacity: number;
    public speed: number;

    constructor(public position: Point) {
        this.queue = [];
        this.lastMessageTime = 0;
        this.capacity = Defaults.serverCapacity;
        this.speed = Defaults.serverSpeed;
    }

    sendMessage(elapsedTime: number) {
        const msg = this.queue.shift();

        if (msg) {
            msg.status = 'ack';
            msg.invertDirection();
            this.lastMessageTime = elapsedTime;
        }
    };

    receiveMessage(message: Message) {
        message.position = { ...this.position };

        if (this.queue.length < this.capacity) {
            this.queue.push(message);
            message.status = 'queued';
        } else {
            message.status = 'nack';
            message.invertDirection();
        }
    };
}