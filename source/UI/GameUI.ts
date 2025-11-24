/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='Button.ts' />
/// <reference path='FullScreenButton.ts' />
/// <reference path='VolumeButton.ts' />

class GameUI {
    public buttons: Button[] = [];

    public readonly settingsButtons: Button[];

    constructor(music: HTMLAudioElement, canvas: Canvas) {
        const w = canvas.width,
            h = canvas.height,
            size = 20,
            y = h - 30,
            p1 = { x: w - 40, y },
            p2 = { x: w - 80, y },
            volumeButton = new VolumeButton(p2, size, music),
            fullScreenButton = new FullScreenButton(p1, size, document.documentElement);

        this.settingsButtons = [
            fullScreenButton,
            volumeButton
        ];
    }

    click(position: Point) {
        this.buttons.some((button) => {
            const { x, y } = position,
                p = button.position;
            if (x > p.x - button.width / 2 && x < p.x + button.width / 2 &&
                y > p.y - button.height / 2 && y < p.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}