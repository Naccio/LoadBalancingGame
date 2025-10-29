/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep8 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker,
        private fader: TextFader
    ) {
        super(7, [
            'Thankfully, you are popular enough to afford to UPGRADE your datacenter.',
            'As your popularity grows, you will be able to upgrade it even more.',
            'Press SPACE to pause the game and select an upgrade.']);

        this.hasHome = true;
        this.advanceOnSpace = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height,
            text = {
                x: w / 2,
                y: h - 116,
                font: '20px sans-serif',
                fontSize: 20,
                fontWeight: '',
                color: { r: 255, g: 0, b: 0 },
                id: 'upgradeTut',
                text: '- Upgrade available! -',
                life: 1000,
                alpha: 0,
                delta: 0
            };

        this.fader.addPermanentText(text);
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

        Utilities.drawText(w / 2, h - 95, 'Press space to pause', '18px sans-serif', 'center', baseline, 'darkGray', context);
    }
}