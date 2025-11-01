/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
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
            font = '18px sans-serif';

        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawText(w / 2, h - 95, 'Press space to pause', '18px sans-serif', 'center', baseline, 'darkGray', context);
    }
}