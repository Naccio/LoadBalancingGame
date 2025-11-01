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
            h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawText({
            x: w / 2,
            y: h - 95,
            text: 'Press space to pause',
            font: '18px sans-serif',
            align: 'center',
            color: 'darkGray'
        }, context);
    }
}