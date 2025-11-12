/// <reference path='GameObject.ts' />
/// <reference path='Point.ts' />

class Message implements GameObject {
    public position: Point;
    public dx: number;
    public dy: number;
    public status: 'req' | 'ack' | 'nack' | 'queued' | 'done';
    public life: number;

    constructor(public sender: MessageTransmitter, public receiver: MessageTransmitter) {
        this.position = { ...sender.position };
        this.dx = 0;
        this.dy = 0;
        this.sender = sender;
        this.receiver = receiver;
        this.status = 'req';
        this.life = 0;
        this.computeVelocity();
    }

    computeVelocity() {
        const rp = this.receiver.position,
            p = this.position,
            xDiff = rp.x - p.x,
            yDiff = rp.y - p.y,
            angle = Math.atan2(yDiff, xDiff),
            v = Defaults.messageVelocity / Defaults.frameRate;
        this.dx = Math.cos(angle) * v;
        this.dy = Math.sin(angle) * v;
    }

    move() {
        const p = this.position;

        this.position = {
            x: p.x + this.dx,
            y: p.y + this.dy
        };
    }

    invertDirection() {
        const tmp = this.sender;
        this.sender = this.receiver;
        this.receiver = tmp;
        this.computeVelocity();
    };
}