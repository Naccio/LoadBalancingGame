/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class GameOver implements Scene {
    private readonly baseline = 'middle';
    private readonly color = 'white';
    private buttons: Button[];

    public id = Defaults.gameModes.GAMEOVER;

    constructor(
        private canvas: HTMLCanvasElement,
        private $clouds: any,
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

        context.clearRect(0, 0, w, h);
        Utilities.drawSky(this.canvas, this.$clouds);
        Utilities.drawText(w / 2, 100, 'Game Over', 'small-caps 60px monospace', 'center', this.baseline, 'red', context);

        this.drawStat(h / 2 - 80, 'Succesful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);

        const font = '30px monospace';
        Utilities.drawText(w / 2 + 68, h / 2 + 50, 'Popularity:', font, 'end', this.baseline, this.color, context);
        Utilities.drawText(w / 2 + 75, h / 2 + 50, this.popularity.popularity.toString(), font, 'start', this.baseline, this.color, context);

        Utilities.drawLine(w / 2 - 130, h / 2 + 20, w / 2 + 130, h / 2 + 20, 'red', 1, context);
    }

    private drawStat(y: number, text: string, value: number) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }

    private drawStatTitle(y: number, text: string) {
        const context = this.canvas.getContext('2d')!,
            x = this.canvas.width / 2 + 80;

        Utilities.drawText(x, y, text + ':', '15px monospace', 'end', this.baseline, this.color, context);
    }

    private drawStatValue(y: number, value: number) {
        const context = this.canvas.getContext('2d')!,
            x = this.canvas.width / 2 + 90;

        Utilities.drawText(x, y, value.toString(), '15px monospace', 'start', this.baseline, this.color, context);
    }
}