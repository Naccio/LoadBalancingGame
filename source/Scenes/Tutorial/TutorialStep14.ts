/// <reference path='../../Commands/NewGame.ts' />
/// <reference path='../../Defaults.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep14 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
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
            new Button(w / 3, h - 40, 120, 40, 'New game', '#FFFFFF', () => newGame.execute())
        ]
    }

    run() {
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
            messageSize = Defaults.messageSize;

        let font = '18px sans-serif';
        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        font = "10px sans-serif";
        Utilities.drawText(w - 118 + messageSize / 2, 100, ': Request', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + messageSize + 5, ': Response (+1)', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ': Datacenter busy (-1)', font, align, baseline, color, context);
        Utilities.drawCircle(w - 120, 100, messageSize / 2, 'lightBlue', 'skyBlue', 2, context);
        Utilities.drawCircle(w - 120, 100 + messageSize + 5, messageSize / 2, 'lime', 'limeGreen', 2, context);
        Utilities.drawCircle(w - 120, 100 + 2 * (messageSize + 5), messageSize / 2, 'tomato', 'indianRed', 2, context);
    }
}