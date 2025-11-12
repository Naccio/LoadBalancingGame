/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='Button.ts' />
/// <reference path='VolumeButton.ts' />

class GameUI {
    public buttons: Button[] = [];

    public readonly volumeButton: VolumeButton;

    constructor(music: HTMLAudioElement, canvas: Canvas) {
        const w = canvas.width,
            h = canvas.height,
            p = {
                x: w - 40,
                y: h - 40
            };

        this.volumeButton = new VolumeButton(p, 20, () => {
            if (music.paused) {
                music.play();
            } else {
                music.pause();
            }
            this.volumeButton.isOn = !music.paused;
        });
    }

    click(x: number, y: number) {
        this.buttons.some((button) => {
            const p = button.position;
            if (x > p.x - button.width / 2 && x < p.x + button.width / 2 &&
                y > p.y - button.height / 2 && y < p.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}