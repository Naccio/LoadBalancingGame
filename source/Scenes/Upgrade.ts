/// <reference path='../Defaults.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/Scheduler.ts' />
/// <reference path='../Services/UpgradesTracker.ts' />
/// <reference path='../UI/BorderButton.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameArea.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='Scene.ts' />

class Upgrade implements Scene {
    public id = Defaults.gameModes.UPGRADE;

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private upgradesTracker: UpgradesTracker,
        private scheduler: Scheduler,
        private gameArea: GameArea,
        private fader: TextFader
    ) { }

    getButtons() {
        const w = this.canvas.width,
            h = this.canvas.height;
        let buttons = [new Button(w / 2, h - 100, 120, 40, 'Cancel', '#333333', () => this.game.switchMode(Defaults.gameModes.PAUSE))];

        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
                buttons = [...buttons, ...this.createServerButtons(s => s.speed += 2)];
                break;
            case 'capacity':
                buttons = [...buttons, ...this.createServerButtons(s => s.capacity += Defaults.serversCapacity)];
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

    update() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        context.clearRect(0, 0, w, h);

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
        Utilities.drawText(w / 2, 60, `~ Select ${text} ~`, '30px monospace', 'center', 'middle', 'red', context);
    }

    private createAreaButton(x: number, y: number, area: string) {
        const w = this.canvas.width,
            h = this.canvas.height;

        return new BorderButton(x, y, Math.floor(w / 3) - 2, Math.floor(h / 3) - 2, '', '#CCCCCC', 'limeGreen', 1, () => {
            this.scheduler.createServer(area);
            this.selectUpgrade();
        });
    }

    private createServerButton(server: Server, action: () => void) {
        return new BorderButton(server.x, server.y, Defaults.serverSize, Defaults.serverSize, '', 'rgba(0,0,0,0)', 'limeGreen', 2, () => {
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