/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class UpgradesIntroduction extends TutorialStep {

    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private popularityTracker: PopularityTracker,
        private fader: TextFader
    ) {
        super([
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
                fontSize: 20,
                rgbColor: { r: 255, g: 0, b: 0 },
                id: 'upgradeTut',
                text: '- Upgrade available! -',
                life: 1000,
                alpha: 0,
                delta: 0
            };

        this.fader.addPermanentText(text);
    }

    update() {
        this.game.update();
    }

    draw() {
        const w = this.canvas.width,
            h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);

        this.canvas.drawText({
            x: w / 2,
            y: h - 95,
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            color: Defaults.secondaryColorMuted
        });
    }
}