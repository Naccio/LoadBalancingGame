/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class GameOver implements Scene {
    private readonly color = 'white';
    private buttons: Button[];

    public id = Defaults.gameModes.GAME_OVER;

    constructor(
        private canvas: HTMLCanvasElement,
        private clouds: Clouds,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularity: PopularityTracker,
        newGame: NewGame
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [
            new Button(w / 2, h - 110, 120, 40, 'Restart', '#FFFFFF', () => newGame.execute()),
            new Button(w / 2, h - 60, 120, 40, 'Menu', '#FFFFFF', () => game.switchMode(Defaults.gameModes.MENU))
        ];
    }

    getButtons() {
        return this.buttons;
    }

    update() {
        var context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        this.clouds.draw();
        Utilities.drawText({
            x: w / 2,
            y: 100,
            text: 'Game Over',
            font: 'small-caps 60px monospace',
            align: 'center',
            color: 'red'
        }, context);

        this.drawStat(h / 2 - 80, 'Successful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);

        const font = '30px monospace';
        Utilities.drawText({
            x: w / 2 + 68,
            y: h / 2 + 50,
            text: 'Popularity:',
            font,
            align: 'end',
            color: this.color
        }, context);
        Utilities.drawText({
            x: w / 2 + 75,
            y: h / 2 + 50,
            text: this.popularity.popularity.toString(),
            font,
            align: 'start',
            color: this.color
        }, context);

        Utilities.drawLine({
            x1: w / 2 - 130,
            y1: h / 2 + 20,
            x2: w / 2 + 130,
            y2: h / 2 + 20,
            color: 'red'
        }, context);
    }

    private drawStat(y: number, text: string, value: number) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }

    private drawStatTitle(y: number, text: string) {
        const context = this.canvas.getContext('2d')!,
            x = this.canvas.width / 2 + 80;

        Utilities.drawText({
            x,
            y,
            text: text + ':',
            font: '15px monospace',
            align: 'end',
            color: this.color
        }, context);
    }

    private drawStatValue(y: number, value: number) {
        const context = this.canvas.getContext('2d')!,
            x = this.canvas.width / 2 + 90;

        Utilities.drawText({
            x,
            y,
            text: value.toString(),
            font: '15px monospace',
            align: 'start',
            color: this.color
        }, context);
    }
}