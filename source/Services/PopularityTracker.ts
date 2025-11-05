/// <reference path='../UI/TextFader.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='../Upgrades/UpgradesTracker.ts' />

class PopularityTracker {
    public popularity: number;

    constructor(private fader: TextFader, private upgrades: UpgradesTracker, private canvas: HTMLCanvasElement) {
        this.popularity = 0;
    }

    draw(y: number) {
        const context = this.canvas.getContext('2d')!;

        Utilities.drawText({
            x: 10,
            y,
            text: 'Popularity: ' + this.popularity,
            fontSize: 18,
            fontFamily: 'sans-serif'
        }, context);
    }

    reset() {
        this.popularity = 0;
    }

    updatePopularity(amount: number, x: number, y: number) {
        let fontSize = 12,
            color = { r: 0, g: 150, b: 0 };

        if (amount < 0) {
            color = { r: 150, g: 0, b: 0 };
        }

        if (Math.abs(amount) >= 5) {
            fontSize = 16;
        }

        this.fader.addText({
            text: amount.toString(),
            rgbColor: color,
            fontSize: fontSize,
            fontWeight: 'bold',
            alpha: 1,
            delta: 0,
            x,
            y
        }, x.toString() + y.toString());

        this.popularity += amount;
        if (this.popularity >= this.upgrades.nextUpgrade) {
            this.upgrades.increaseUpgrades();
        }
    }
}