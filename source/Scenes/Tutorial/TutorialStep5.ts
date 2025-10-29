/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
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
            w = this.canvas.width,
            h = this.canvas.height,
            align: CanvasTextAlign = 'start',
            baseline: CanvasTextBaseline = 'middle',
            color = 'black',
            messageSize = Defaults.messageSize;

        let font = '18px sans-serif';
        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);
        Utilities.drawCircleHighlight(70, h - 95, 67, context);

        font = "10px sans-serif";
        Utilities.drawText(w - 118 + messageSize / 2, 100, ': Request', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + messageSize + 5, ': Response (+1)', font, align, baseline, color, context);
        Utilities.drawCircle(w - 120, 100, messageSize / 2, 'lightBlue', 'skyBlue', 2, context);
        Utilities.drawCircle(w - 120, 100 + messageSize + 5, messageSize / 2, 'lime', 'limeGreen', 2, context);
    }
}