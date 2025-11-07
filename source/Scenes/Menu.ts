/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameUI.ts' />
/// <reference path='../UI/SimpleButton.ts' />
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
            Utilities.defaultButton(w / 2, h / 2, 'Tutorial', () => tutorial.reset()),
            Utilities.defaultButton(w / 2, h / 2 + 60, 'New Game', () => newGame.execute()),
            Utilities.defaultButton(w / 2, h / 2 + 120, 'Credits', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ui.volumeButton
        ];
    }

    getButtons() {
        return this.buttons;
    }

    update() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            align = 'center',
            color = Defaults.primaryColorTransparent;

        this.clouds.draw();

        Utilities.drawRect({
            x: w / 2,
            y: 140,
            width: w,
            height: 180,
            color: Defaults.secondaryColorTransparent,
            borderColor: Defaults.primaryColorMutedTransparent
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: 110,
            text: 'Load Balancing',
            fontVariant: 'small-caps',
            fontWeight: 'bold',
            fontSize: 110,
            align,
            color
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: 185,
            text: 'The Game',
            fontSize: 45,
            align,
            color
        }, context);

        Utilities.drawLine({
            x1: 120,
            y1: 160,
            x2: w - 118,
            y2: 160,
            color: Defaults.accentColor,
            width: 2
        }, context);
    }
}