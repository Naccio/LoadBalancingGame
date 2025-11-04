/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/UpgradesTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameUI.ts' />
/// <reference path='../UI/SimpleButton.ts' />
/// <reference path='../Upgrades/CapacityUpgradeButton.ts' />
/// <reference path='../Upgrades/ServerUpgradeButton.ts' />
/// <reference path='../Upgrades/SpeedUpgradeButton.ts' />
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
        const w = canvas.width,
            h = this.canvas.height,
            y = h / 2 + 150;

        this.buttons = [
            Utilities.defaultButton(w / 2, 150, 'Continue', () => game.switchMode(Defaults.gameModes.GAME)),
            Utilities.defaultButton(w / 2, 210, 'New game', () => newGame.execute()),
            Utilities.defaultButton(w / 2, 270, 'Abandon', () => game.switchMode(Defaults.gameModes.MENU)),
            ui.volumeButton
        ];

        this.upgradeButtons = [
            new ServerUpgradeButton(250, y, () => this.selectUpgrade('server')),
            new CapacityUpgradeButton(w / 2, y, () => this.selectUpgrade('capacity')),
            new SpeedUpgradeButton(w - 250, y, () => this.selectUpgrade('speed'))
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
            font = '25px monospace',
            color;

        this.clouds.draw();

        if (this.upgradesTracker.upgradesAvailable > 0) {
            color = 'black';
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: 'Choose an upgrade:',
                font,
                align: 'center',
                color
            }, context);
        } else {
            color = '#DDDDDD';
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: 'No upgrades available',
                font,
                align: 'center',
                color
            }, context);
        }

        color = 'red';
        font = '50px monospace';
        Utilities.drawText({
            x,
            y: 60,
            text: '~ Paused ~',
            font,
            align: 'center',
            color
        }, context);
    }

    private selectUpgrade(id: string) {
        this.upgradesTracker.selectedUpgrade = id;
        this.game.switchMode(Defaults.gameModes.UPGRADE);
    }
}