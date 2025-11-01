/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameUI.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />
/// <reference path='Tutorial/Tutorial.ts' />

class Menu implements Scene {
    private buttons: Button[];

    public id = Defaults.gameModes.MENU;

    constructor(
        private canvas: HTMLCanvasElement,
        private clouds: Clouds,
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
            align = "center",
            baseline = "middle",
            color = "rgba(255,255,255,0.6)";

        this.clouds.draw();

        Utilities.drawRect({
            x: w / 2,
            y: 140,
            width: w,
            height: 180,
            color: 'rgba(0,0,0,0.1)',
            borderColor: 'rgba(200,200,200,0.5)',
            borderWidth: 1
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: 110,
            text: 'Load Balancing',
            font: 'small-caps bold 110px monospace',
            align,
            color
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: 185,
            text: 'The Game',
            font: '45px monospace',
            align,
            color
        }, context);

        Utilities.drawLine(120, 160, w - 118, 160, 'red', 2, context);
    }
}