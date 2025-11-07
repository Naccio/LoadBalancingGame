/// <reference path='Button.ts' />
/// <reference path='VolumeButton.ts' />

class GameUI {
    public buttons: Button[] = [];

    public readonly volumeButton: VolumeButton;

    constructor(music: HTMLAudioElement, canvas: HTMLCanvasElement) {
        const w = canvas.width,
            h = canvas.height,
            x = w - 40,
            y = h - 40;

        this.volumeButton = new VolumeButton(x, y, 20, () => {
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
            if (x > button.x - button.width / 2 && x < button.x + button.width / 2 &&
                y > button.y - button.height / 2 && y < button.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}