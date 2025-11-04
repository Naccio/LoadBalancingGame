/// <reference path='MessageTransmitter.ts' />

class Server implements MessageTransmitter {
    public queue: Message[];
    public lastMessageTime: number;
    public capacity: number;
    public speed: number;

    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
        this.queue = [];
        this.lastMessageTime = 0;
        this.capacity = Defaults.serversCapacity;
        this.speed = Defaults.serversSpeed;
    }

    sendMessage(elapsedTime: number) {
        const msg = this.queue.shift();

        if (msg) {
            msg.status = "ack";
            msg.invertDirection();
            this.lastMessageTime = elapsedTime;
        }
    };

    receiveMessage(message: Message) {
        message.x = this.x;
        message.y = this.y;

        if (this.queue.length < this.capacity) {
            this.queue.push(message);
            message.status = "queued";
        } else {
            message.status = "nack";
            message.invertDirection();
        }
    };
}