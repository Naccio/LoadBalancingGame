/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='../Upgrades/UpgradesTracker.ts' />

class PopularityTracker {
    public popularity: number;

    constructor(private fader: TextFader, private upgrades: UpgradesTracker, private canvas: Canvas) {
        this.popularity = 0;
    }

    draw(y: number) {
        this.canvas.drawText({
            x: 10,
            y,
            text: 'Popularity: ' + this.popularity,
            fontSize: 18,
            fontFamily: 'sans-serif'
        });
    }

    reset() {
        this.popularity = 0;
    }

    updatePopularity(amount: number, x: number, y: number) {
        let fontSize = amount >= 5 ? 16 : 12,
            color = amount < 0
                ? { r: 150, g: 0, b: 0 }
                : { r: 0, g: 150, b: 0 };

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