/// <reference path='../Commands/NewGame.ts' />
/// <reference path='../Graphics/Canvas.ts' />
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
        private canvas: Canvas,
        private clouds: Clouds,
        game: GameTracker,
        ui: GameUI,
        tutorial: Tutorial,
        newGame: NewGame
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [
            Utilities.defaultButton({ x: w / 2, y: h / 2 }, 'Tutorial', () => tutorial.reset()),
            Utilities.defaultButton({ x: w / 2, y: h / 2 + 60 }, 'New Game', () => newGame.execute()),
            Utilities.defaultButton({ x: w / 2, y: h / 2 + 120 }, 'Credits', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ...ui.settingsButtons
        ];
    }

    getButtons() {
        return this.buttons;
    }

    draw() {
        const w = this.canvas.width,
            align = 'center',
            color = Defaults.primaryColorTransparent;

        this.clouds.draw();

        this.canvas.drawRect({
            position: {
                x: w / 2,
                y: 140
            },
            width: w,
            height: 180,
            color: Defaults.secondaryColorTransparent,
            borderColor: Defaults.primaryColorMutedTransparent
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 110
            },
            text: 'Load Balancing',
            fontVariant: 'small-caps',
            fontWeight: 'bold',
            fontSize: 110,
            align,
            color
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 185
            },
            text: 'The Game',
            fontSize: 45,
            align,
            color
        });

        this.canvas.drawLine({
            from: {
                x: 120,
                y: 160
            },
            to: {
                x: w - 118,
                y: 160
            },
            color: Defaults.accentColor,
            width: 2
        });
    }

    update() { }
}