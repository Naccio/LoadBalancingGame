/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep13 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(12, [
            'Perfect! Now you have a new datacenter at your disposal.',
            'This is when a good load balancing strategy will start to matter.',
            'Indeed you would be wiser to connect the clients to the new datacenter.']);

        this.hasHome = true;
    }

    setup() {
        this.game.clients[0].life = - 21;
        this.game.clients[1].life = - 21;
    }

    run() {
        if (this.game.clients.length === 0) {
            const w = this.canvas.width,
                h = this.canvas.height,
                client0 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 3, 10000),
                client1 = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 3, 10000);

            client0.life = - 21;
            client1.life = - 21;

            this.game.clients.push(client0, client1);
        }
        if (this.game.clients[0].connectedTo !== undefined && this.game.clients[1].connectedTo !== undefined) {
            this.advance = true;
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            h = this.canvas.height,
            align: CanvasTextAlign = 'start',
            baseline: CanvasTextBaseline = 'middle',
            color = 'black',
            font = '18px sans-serif';

        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        TutorialHelper.drawLegend(this.canvas, true);
    }
}