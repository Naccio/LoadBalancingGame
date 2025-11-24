/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/SimpleButton.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class Credits implements Scene {
    private buttons: SimpleButton[];

    public id = Defaults.gameModes.CREDITS;

    public constructor(private canvas: Canvas, private clouds: Clouds, game: GameTracker) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [Utilities.defaultButton({
            x: w / 2,
            y: h - 60
        },
            'Back',
            () => {
                game.switchMode(Defaults.gameModes.MENU);
            })];
    }

    getButtons() {
        return this.buttons;
    }

    draw() {
        this.clouds.draw();

        this.drawCredits(128, 'An idea by:', 'Treestle', '(treestle.com)');
        this.drawCredits(258, 'Designed and developed by:', 'Naccio', '(naccio.net)');
        this.drawCredits(388, 'Music by:', 'Macspider', '(soundcloud.com/macspider)');
    }

    update() { }

    private drawCredits(y: number, heading: string, text: string, subText: string) {
        this.drawRect(y);
        this.drawHeading(y - 28, heading);
        this.drawMainText(y, text);
        this.drawSubText(y + 28, subText);
    }

    private drawRect(y: number) {
        const w = this.canvas.width;

        this.canvas.drawRect({
            position: {
                x: w / 2,
                y
            },
            width: w,
            height: 100,
            color: Defaults.secondaryColorTransparent,
            borderColor: Defaults.primaryColorMutedTransparent
        });
    }

    private drawHeading(y: number, text: string) {
        this.drawText(y, text, 20, Defaults.accentColor, 'bold');
    }

    private drawMainText(y: number, text: string) {
        this.drawText(y, text, 30, Defaults.primaryColor);
    }

    private drawSubText(y: number, text: string) {
        this.drawText(y, text, 15, Defaults.primaryColorMuted);
    }

    private drawText(y: number, text: string, fontSize: number, color: string, fontWeight?: 'bold') {
        const w = this.canvas.width;

        this.canvas.drawText({
            position: {
                x: w / 2,
                y
            },
            text,
            fontSize,
            fontWeight,
            align: 'center',
            color
        });
    }
}