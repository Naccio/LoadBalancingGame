/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameUI.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />
/// <reference path='Tutorial/Tutorial.ts' />

class Menu implements Scene {
    private buttons: Button[];

    constructor(
        private canvas: HTMLCanvasElement,
        private $clouds: any,
        game: GameTracker,
        ui: GameUI,
        tutorial: Tutorial,
        newGame: NewGame
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [
            new Button(w / 2, h / 2, 120, 40, 'Tutorial', '#FFFFFF', () => tutorial.reset()),
            new Button(w / 2, h / 2 + 60, 120, 40, 'New Game', '#FFFFFF', () => newGame.execute()),
            new Button(w / 2, h / 2 + 120, 120, 40, 'Credits', '#FFFFFF', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ui.volumeButton
        ];
    }

    getButtons() {
        return this.buttons;
    }

    update() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            align = "center",
            baseline = "middle",
            color = "rgba(255,255,255,0.6)";

        context.clearRect(0, 0, w, h);
        Utilities.drawSky(this.canvas, this.$clouds);

        Utilities.drawRect(w / 2, 140, w, 180, 'rgba(0,0,0,0.1)', 'rgba(200,200,200,0.5)', 0, context);
        Utilities.drawText(w / 2, 110, 'Load Balancing', 'small-caps bold 110px monospace', align, baseline, color, context);
        Utilities.drawText(w / 2, 185, 'The Game', '45px monospace', align, baseline, color, context);

        Utilities.drawLine(120, 160, w - 118, 160, 'red', 2, context);
    }
}