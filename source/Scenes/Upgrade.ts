/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/Scheduler.ts' />
/// <reference path='../Upgrades/UpgradesTracker.ts' />
/// <reference path='../UI/BorderButton.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameArea.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='Scene.ts' />

class Upgrade implements Scene {
    public id = Defaults.gameModes.UPGRADE;

    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private upgradesTracker: UpgradesTracker,
        private scheduler: Scheduler,
        private gameArea: GameArea,
        private fader: TextFader
    ) { }

    getButtons() {
        const w = this.canvas.width,
            h = this.canvas.height,
            button = Utilities.defaultButton(w / 2, h - 100, 'Cancel', () => this.game.switchMode(Defaults.gameModes.PAUSE));

        button.color = Defaults.secondaryColor;

        let buttons: Button[] = [button];

        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
                buttons = [...buttons, ...this.createServerButtons(s => s.speed += 2)];
                break;
            case 'capacity':
                buttons = [...buttons, ...this.createServerButtons(s => s.capacity += Defaults.serverCapacity)];
                break;
            case 'server':
                buttons = [...buttons,
                this.createAreaButton(Math.floor(w / 6), Math.floor(h / 6), 'nw'),
                this.createAreaButton(Math.floor(w / 2), Math.floor(h / 6), 'n'),
                this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h / 6), 'ne'),
                this.createAreaButton(Math.floor(w / 6), Math.floor(h / 2), 'w'),
                this.createAreaButton(Math.floor(w / 2), Math.floor(h / 2), 'c'),
                this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h / 2), 'e'),
                this.createAreaButton(Math.floor(w / 6), Math.floor(h * 5 / 6), 'sw'),
                this.createAreaButton(Math.floor(w / 2), Math.floor(h * 5 / 6), 's'),
                this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h * 5 / 6), 'se')
                ];
                break;
        }

        return buttons;
    }

    draw() {
        const w = this.canvas.width;

        this.canvas.clear();
        this.gameArea.drawServers();

        let text;
        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
            case 'capacity':
                text = 'location';
                break;
            case 'server':
                text = 'zone';
                break;
        }
        this.canvas.drawText({
            x: w / 2,
            y: 60,
            text: `~ Select ${text} ~`,
            fontSize: 30,
            align: 'center',
            color: Defaults.accentColor
        });
    }

    update() { }

    private createAreaButton(x: number, y: number, area: string) {
        const w = this.canvas.width,
            h = this.canvas.height,
            borderWidth = Defaults.highlightWidth;

        return new BorderButton(x, y, Math.floor(w / 3) - borderWidth, Math.floor(h / 3) - borderWidth, 'transparent', Defaults.highlightColor, borderWidth, () => {
            this.scheduler.createServer(area);
            this.selectUpgrade();
        });
    }

    private createServerButton(server: Server, action: () => void) {
        const borderWidth = Defaults.highlightWidth,
            size = Defaults.serverSize + borderWidth;

        return new BorderButton(server.x, server.y, size, size, 'transparent', Defaults.highlightColor, borderWidth, () => {
            action();
            this.selectUpgrade();
        });
    }

    private createServerButtons(action: (s: Server) => void) {
        return this.game.servers.map((s) => this.createServerButton(s, () => action(s)));
    }

    private selectUpgrade() {
        this.upgradesTracker.selectedUpgrade = undefined;
        this.upgradesTracker.upgradesAvailable -= 1;
        this.fader.removeFromPermanentQueue('upgrade');
        this.game.switchMode(Defaults.gameModes.PAUSE);
    }
}