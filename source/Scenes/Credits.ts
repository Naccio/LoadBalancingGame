/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Scene.ts' />

class Credits implements Scene {
    private buttons: Button[];

    public id = Defaults.gameModes.CREDITS;

    public constructor(private canvas: HTMLCanvasElement, private clouds: Clouds, game: GameTracker) {
        const w = canvas.width,
            h = canvas.height;

        this.buttons = [new Button(w / 2, h - 60, 120, 40, "Back", "#FFFFFF", () => {
            game.switchMode(Defaults.gameModes.MENU);
        })];
    }

    getButtons() {
        return this.buttons;
    }

    update() {
        this.clouds.draw();

        this.drawCredits(128, 'An idea by:', 'Treestle', '(treestle.com)');
        this.drawCredits(258, 'Designed and developed by:', 'Naccio', '(naccio.net)');
        this.drawCredits(388, 'Music by:', 'Macspider', '(soundcloud.com/macspider)');
    }

    private drawCredits(y: number, heading: string, text: string, subText: string) {
        this.drawRect(y);
        this.drawHeading(y - 28, heading);
        this.drawMainText(y, text);
        this.drawSubText(y + 28, subText);
    }

    private drawRect(y: number) {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width;

        Utilities.drawRect(w / 2, y, w, 100, 'rgba(0,0,0,0.1)', 'rgba(200,200,200,0.5)', 0, context);
    }

    private drawHeading(y: number, text: string) {
        this.drawText(y, text, 'bold 20px monospace', 'red');
    }

    private drawMainText(y: number, text: string) {
        this.drawText(y, text, '30px monospace', 'white');
    }

    private drawSubText(y: number, text: string) {
        this.drawText(y, text, '15px monospace', '#ddd');
    }

    private drawText(y: number, text: string, font: string, color: string) {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            align = "center",
            baseline = "middle";

        Utilities.drawText(w / 2, y, text, font, align, baseline, color, context)
    }
}