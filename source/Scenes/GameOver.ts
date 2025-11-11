/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../UI/SimpleButton.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class GameOver implements Scene {
    private readonly color = Defaults.primaryColor;

    private buttons: SimpleButton[];

    public id = Defaults.gameModes.GAME_OVER;

    constructor(
        private canvas: Canvas,
        private clouds: Clouds,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularity: PopularityTracker,
        newGame: NewGame
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [
            Utilities.defaultButton(w / 2, h - 110, 'Restart', () => newGame.execute()),
            Utilities.defaultButton(w / 2, h - 60, 'Menu', () => game.switchMode(Defaults.gameModes.MENU))
        ];
    }

    getButtons() {
        return this.buttons;
    }

    draw() {
        var w = this.canvas.width,
            h = this.canvas.height;

        this.clouds.draw();
        this.canvas.drawText({
            x: w / 2,
            y: 100,
            text: 'Game Over',
            fontSize: 60,
            fontVariant: 'small-caps',
            align: 'center',
            color: Defaults.accentColor
        });

        this.drawStat(h / 2 - 80, 'Successful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);

        const fontSize = 30;
        this.canvas.drawText({
            x: w / 2 + 68,
            y: h / 2 + 50,
            text: 'Popularity:',
            fontSize,
            align: 'end',
            color: this.color
        });
        this.canvas.drawText({
            x: w / 2 + 75,
            y: h / 2 + 50,
            text: this.popularity.popularity.toString(),
            fontSize,
            align: 'start',
            color: this.color
        });

        this.canvas.drawLine({
            x1: w / 2 - 130,
            y1: h / 2 + 20,
            x2: w / 2 + 130,
            y2: h / 2 + 20,
            color: Defaults.accentColor
        });
    }

    update() { }

    private drawStat(y: number, text: string, value: number) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }

    private drawStatTitle(y: number, text: string) {
        const x = this.canvas.width / 2 + 80;

        this.canvas.drawText({
            x,
            y,
            text: text + ':',
            fontSize: 15,
            align: 'end',
            color: this.color
        });
    }

    private drawStatValue(y: number, value: number) {
        const x = this.canvas.width / 2 + 90;

        this.canvas.drawText({
            x,
            y,
            text: value.toString(),
            fontSize: 15,
            align: 'start',
            color: this.color
        });
    }
}