/// <reference path='GameObject.ts' />
/// <reference path='Point.ts' />

class Message implements GameObject {
    private speed;

    public position: Point;
    public status: 'req' | 'ack' | 'nack' | 'queued' | 'done';
    public life: number;

    constructor(public sender: MessageTransmitter, public receiver: MessageTransmitter) {
        this.position = { ...sender.position };
        this.status = 'req';
        this.life = 0;

        this.speed = VectorMath.direction(sender.position, receiver.position)
            .multiply(Defaults.messageVelocity);
    }

    move() {
        this.position = this.speed
            .divide(Defaults.frameRate)
            .add(this.position);
    }

    invertDirection() {
        const tmp = this.sender;
        this.sender = this.receiver;
        this.receiver = tmp;
        this.speed = this.speed.invert();
    };
}