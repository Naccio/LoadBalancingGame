/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Upgrades/UpgradesTracker.ts' />
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
        private canvas: Canvas,
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
            Utilities.defaultButton({ x: w / 2, y: 150 }, 'Continue', () => game.switchMode(Defaults.gameModes.GAME)),
            Utilities.defaultButton({ x: w / 2, y: 210 }, 'New game', () => newGame.execute()),
            Utilities.defaultButton({ x: w / 2, y: 270 }, 'Abandon', () => game.switchMode(Defaults.gameModes.MENU)),
            ...ui.settingsButtons
        ];

        this.upgradeButtons = [
            new ServerUpgradeButton({ x: 250, y }, () => this.selectUpgrade('server')),
            new CapacityUpgradeButton({ x: w / 2, y }, () => this.selectUpgrade('capacity')),
            new SpeedUpgradeButton({ x: w - 250, y }, () => this.selectUpgrade('speed'))
        ];
    }

    getButtons() {
        return this.upgradesTracker.upgradesAvailable > 0
            ? [...this.buttons, ...this.upgradeButtons]
            : [...this.buttons];
    }

    draw() {
        const w = this.canvas.width,
            h = this.canvas.height,
            x = w / 2,
            fontSize = 25;

        this.clouds.draw();

        if (this.upgradesTracker.upgradesAvailable > 0) {
            this.canvas.drawText({
                position: {
                    x,
                    y: h / 2 + 60
                },
                text: 'Choose an upgrade:',
                fontSize,
                align: 'center',
                color: Defaults.secondaryColor
            });
        } else {
            this.canvas.drawText({
                position: {
                    x,
                    y: h / 2 + 60
                },
                text: 'No upgrades available',
                fontSize,
                align: 'center',
                color: Defaults.primaryColorMuted
            });
        }

        this.canvas.drawText({
            position: {
                x,
                y: 60
            },
            text: '~ Paused ~',
            fontSize: 50,
            align: 'center',
            color: Defaults.accentColor
        });
    }

    update() { }

    private selectUpgrade(id: string) {
        this.upgradesTracker.selectedUpgrade = id;
        this.game.switchMode(Defaults.gameModes.UPGRADE);
    }
}