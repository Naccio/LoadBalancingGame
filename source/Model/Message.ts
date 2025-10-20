class Message {
    public x: number;
    public y: number;
    public dx: number;
    public dy: number;
    public status: string;
    public life: number;

    constructor(public sender: MessageTransmitter, public receiver: MessageTransmitter) {
        this.x = sender.x;
        this.y = sender.y;
        this.dx = 0;
        this.dy = 0;
        this.sender = sender;
        this.receiver = receiver;
        this.status = "req";
        this.life = 0;
        this.computeVelocity();
    }

    computeVelocity() {
        var xDiff = this.receiver.x - this.x,
            yDiff = this.receiver.y - this.y,
            angle = Math.atan2(yDiff, xDiff),
            v = Defaults.messageVelocity / Defaults.frameRate;
        this.dx = Math.cos(angle) * v;
        this.dy = Math.sin(angle) * v;
    };

    move() {
        this.x += this.dx;
        this.y += this.dy;
    };

    invertDirection() {
        const tmp = this.sender;
        this.sender = this.receiver;
        this.receiver = tmp;
        this.computeVelocity();
    };
}