/// <reference path='../../Commands/NewGame.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep14 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private popularityTracker: PopularityTracker,
        newGame: NewGame
    ) {
        super(13, [
            'Excellent! By now you should know all the basics.',
            'This tutorial is finished.',
            'You can start a new game or go back to the main menu.']);

        const w = canvas.width,
            h = canvas.height;

        this.hasHome = true;

        this.extraButtons = [
            Utilities.defaultButton(w / 3, h - 40, 'New game', () => newGame.execute())
        ]
    }

    run() {
        this.game.update();
    }

    draw() {
        const h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}