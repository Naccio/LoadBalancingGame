/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep10 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(9, [
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

    run() {
        if (this.game.clients.length === 0) {
            this.hasNext = true;
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            align: CanvasTextAlign = 'start',
            baseline: CanvasTextBaseline = 'middle',
            color = 'black',
            serverSize = Defaults.serverSize,
            font = '18px sans-serif';

        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawCircleHighlight(w / 2 - serverSize / 2 + 7, h / 2 + serverSize / 4, 15, context);
    }
}