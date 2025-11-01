/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep5 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(4, [
            'Good job! Now your very first client is being served.',
            'You can see the REQUESTS and RESPONSES traveling along the connection.',
            'The POPULARITY measures how successful your service is being.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    setup() {
        this.popularityTracker.popularity = 0;
    }

    run() {
        this.orchestrator.updateMessages();
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);

        Utilities.drawCircleHighlight(70, h - 95, 67, context);
    }
}