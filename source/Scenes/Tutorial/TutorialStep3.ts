/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep3 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(2, [
            'This is a CLIENT.',
            'It wants to exchange data with your datacenter.',
            'Your job will be to connect the clients to a datacenter.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 2, 10000);

        client.life = -31;

        this.game.clients.push(client);
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        Utilities.drawCircleHighlight(w * 3 / 4, h / 2, Defaults.clientSize + 9, context);
        Utilities.drawCircle(w * 3 / 4, h / 2, Defaults.clientSize / 2, 'gray', '', 0, context);
    }
}