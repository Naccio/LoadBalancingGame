/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class ClientSuccessExplanation extends TutorialStep {

    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super([
            'Nice! You can see your datacenter\'s speed in the bottom left of it.',
            'Now the clients can finish their data exchange without any more problems.',
            'When a client is served successfully you will gain some more popularity.']);

        this.hasHome = true;
    }

    setup() {
        this.game.clients[0].messagesToSend = 2;
        this.game.clients[0].ACKsToReceive = 2;
        this.game.clients[1].messagesToSend = 6;
        this.game.clients[1].ACKsToReceive = 6;
        this.game.clients[2].messagesToSend = 10;
        this.game.clients[2].ACKsToReceive = 10;
        this.orchestrator.messages.forEach(function (message) {
            if (message.status === 'ack') {
                (<Client>message.receiver).ACKsToReceive += 1;
            }
            if (message.status === 'queued' || message.status === 'req') {
                (<Client>message.sender).ACKsToReceive += 1;
            }
        });
    }

    update() {
        if (this.game.clients.length === 0) {
            this.hasNext = true;
        }
        this.game.update();
    }

    draw() {
        const w = this.canvas.width,
            h = this.canvas.height,
            serverSize = Defaults.serverSize,
            position = {
                x: w / 2 - serverSize / 2 + 7,
                y: h / 2 + serverSize / 4
            };

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawCircleHighlight(position, 15, this.canvas);
    }
}