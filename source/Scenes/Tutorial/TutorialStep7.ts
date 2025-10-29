/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep7 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(6, [
            'Oh no! Looks like your datacenter can\'t handle all this traffic!',
            'Clients will not be pleased if your datacenter is too busy to reply.',
            'You can see how busy a datacenter is by looking at its status bar.']);

        this.hasNext = true;
        this.hasHome = true;
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
            messageSize = Defaults.messageSize,
            serverSize = Defaults.serverSize;

        let font = '18px sans-serif';
        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        font = "10px sans-serif";
        Utilities.drawText(w - 118 + messageSize / 2, 100, ': Request', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + messageSize + 5, ': Response (+1)', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ': Datacenter busy (-1)', font, align, baseline, color, context);
        Utilities.drawCircle(w - 120, 100, messageSize / 2, 'lightBlue', 'skyBlue', 2, context);
        Utilities.drawCircle(w - 120, 100 + messageSize + 5, messageSize / 2, 'lime', 'limeGreen', 2, context);
        Utilities.drawCircle(w - 120, 100 + 2 * (messageSize + 5), messageSize / 2, 'tomato', 'indianRed', 2, context);

        Utilities.drawCircleHighlight(w / 2 + serverSize / 2 - 7, h / 2 + 1, serverSize / 2, context);
    }
}