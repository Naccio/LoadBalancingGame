/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/UpgradesTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameUI.ts' />
/// <reference path='../UI/SpecialButton.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class Pause implements Scene {
    private buttons: Button[];
    private upgradeButtons: Button[];

    public id = Defaults.gameModes.PAUSE;

    constructor(
        private canvas: HTMLCanvasElement,
        private clouds: Clouds,
        private game: GameTracker,
        private upgradesTracker: UpgradesTracker,
        ui: GameUI,
        newGame: NewGame
    ) {
        const context = canvas.getContext('2d')!,
            w = canvas.width,
            serverSize = Defaults.serverSize;

        this.buttons = [
            new Button(w / 2, 150, 120, 40, 'Continue', '#FFFFFF', () => game.switchMode(Defaults.gameModes.GAME)),
            new Button(w / 2, 210, 120, 40, "New game", "#FFFFFF", () => newGame.execute()),
            new Button(w / 2, 270, 120, 40, "Abandon", "#FFFFFF", () => game.switchMode(Defaults.gameModes.MENU)),
            ui.volumeButton
        ];

        //TODO: Unify upgrade buttons code with tutorial step 9 and 12
        this.upgradeButtons = [
            this.createUpgradeButton(250, 'server', 'Buy new datacenter', (x: number, y: number) => {
                Utilities.drawText({
                    x: x - 25,
                    y,
                    text: "+",
                    font: '45px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
                Utilities.drawRect(x + 15, y, serverSize, serverSize, '#DDDDDD', 'red', 1, context);
                Utilities.drawStar(x - serverSize / 2 + 22, y + serverSize / 2 - 9, 5, 4, 2, "#BBBBBB", "#999999", 2, context);
                Utilities.drawRect(x + serverSize / 2 + 8, y + 1, 6, serverSize - 10, "#BBBBBB", "#999999", 1, context);
            }),
            this.createUpgradeButton(w / 2, 'capacity', 'Scale off at one location', (x: number, y: number) => {
                var queueX = x + serverSize / 2 - 7,
                    queueY = y + 1,
                    starX = x - serverSize / 2 + 7,
                    starY = y + serverSize / 2 - 9,
                    color = 'red',
                    lineWidth = 3;
                Utilities.drawRect(x, y, serverSize, serverSize, "#DDDDDD", "#999999", 1, context);
                Utilities.drawRect(queueX, queueY, 6, serverSize - 10, "salmon", "red", 1, context);
                Utilities.drawStar(starX, starY, 5, 4, 2, "#BBBBBB", "#999999", 2, context);
                Utilities.drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth, context);
                Utilities.drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
                Utilities.drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            }),
            this.createUpgradeButton(w - 250, 'speed', 'Improve speed at one location', (x: number, y: number) => {
                var queueX = x + serverSize / 2 - 7,
                    queueY = y + 1,
                    starX = x - serverSize / 2 + 7,
                    starY = y + serverSize / 2 - 9,
                    color = "red",
                    lineWidth = 3;
                Utilities.drawRect(x, y, serverSize, serverSize, "#DDDDDD", "#999999", 1, context);
                Utilities.drawRect(queueX, queueY, 6, serverSize - 10, "#BBBBBB", "#999999", 1, context);
                Utilities.drawStar(starX, starY, 5, 4, 2, "salmon", "red", 2, context);
                Utilities.drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth, context);
                Utilities.drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth, context);
                Utilities.drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth, context);
            })
        ];
    }

    getButtons() {
        return this.upgradesTracker.upgradesAvailable > 0
            ? [...this.buttons, ...this.upgradeButtons]
            : [...this.buttons];
    }

    update() {
        var context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            x = w / 2,
            font = "25px monospace",
            color;

        this.clouds.draw();

        if (this.upgradesTracker.upgradesAvailable > 0) {
            color = "black";
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: "Choose an upgrade:",
                font,
                align: 'center',
                color
            }, context);
        } else {
            color = "#DDDDDD";
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: "No upgrades available",
                font,
                align: 'center',
                color
            }, context);
        }

        color = "red";
        font = "50px monospace";
        Utilities.drawText({
            x,
            y: 60,
            text: "~ Paused ~",
            font,
            align: 'center',
            color
        }, context);
    }

    private createUpgradeButton(x: number, id: string, text: string, draw: (x: number, y: number) => void) {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            y = h / 2 + 150;

        return new SpecialButton(x, y, 100, 100, '#333333', 'white', 2, () => {
            this.upgradesTracker.selectedUpgrade = id;
            this.game.switchMode(Defaults.gameModes.UPGRADE);
        }, (hovered) => {
            draw(x, y);

            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text,
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        });
    }
}