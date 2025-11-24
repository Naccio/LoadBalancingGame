/// <reference path='../Defaults.ts' />
/// <reference path='../Model/Client.ts' />
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
            position: {
                x: 10,
                y
            },
            text: 'Popularity: ' + this.popularity,
            fontSize: 18,
            fontFamily: 'sans-serif'
        });
    }

    reset() {
        this.popularity = 0;
    }

    updatePopularity(client: Client, amount: number) {
        let fontSize = amount >= 5 ? 16 : 12,
            color = amount < 0
                ? { r: 150, g: 0, b: 0 }
                : { r: 0, g: 150, b: 0 },
            position = {
                x: client.position.x,
                y: client.position.y - 8 - Defaults.clientSize / 2
            };

        this.fader.addText({
            text: amount.toString(),
            rgbColor: color,
            fontSize: fontSize,
            fontWeight: 'bold',
            alpha: 1,
            delta: 0,
            position
        });

        this.popularity += amount;
        if (this.popularity >= this.upgrades.nextUpgrade) {
            this.upgrades.increaseUpgrades();
        }
    }
}