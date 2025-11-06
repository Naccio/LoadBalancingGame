/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep7 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private popularityTracker: PopularityTracker
    ) {
        super([
            'Oh no! Looks like your datacenter can\'t handle all this traffic!',
            'Clients will not be pleased if your datacenter is too busy to reply.',
            'You can see how busy a datacenter is by looking at its status bar.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    run() {
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            serverSize = Defaults.serverSize;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawCircleHighlight(w / 2 + serverSize / 2 - 7, h / 2 + 1, serverSize / 2, context);
    }
}