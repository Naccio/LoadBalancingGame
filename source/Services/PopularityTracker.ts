/// <reference path='../UI/TextFader.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradesTracker.ts' />

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
            text: "Popularity: " + this.popularity,
            font: '18px sans-serif'
        }, context);
    }

    reset() {
        this.popularity = 0;
    }

    updatePopularity(amount: number, x: number, y: number) {
        let fontSize = 12,
            color = { r: 0, g: 150, b: 0 },
            borderColor = { r: 150, g: 250, b: 150 },
            borderWidth = 1;

        if (amount < 0) {
            color = { r: 150, g: 0, b: 0 };
            borderColor = { r: 250, g: 150, b: 150 };
        }

        if (Math.abs(amount) >= 5) {
            fontSize = 16;
            borderWidth = 2;
        }

        const text = {
            text: amount.toString(),
            color: color,
            fontSize: fontSize,
            fontWeight: "bold",
            border: true,
            borderColor: borderColor,
            borderWidth: borderWidth,
            alpha: 1,
            font: '',
            delta: 0
        }

        this.fader.addText(text, x.toString() + y.toString());
        this.popularity += amount;
        if (this.popularity >= this.upgrades.nextUpgrade) {
            this.upgrades.increaseUpgrades();
        }
    }
}