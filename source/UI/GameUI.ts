/// <reference path='Button.ts' />

class GameUI {
    public buttons: Button[] = [];

    public readonly volumeButton: SpecialButton;

    constructor(music: HTMLAudioElement, canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d')!,
            WIDTH = canvas.width,
            HEIGHT = canvas.height,
            x = WIDTH - 40,
            y = HEIGHT - 40,
            w = 20,
            h = 20;

        this.volumeButton = new SpecialButton(x, y, w, h, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 0, () => {
            if (music.paused) {
                music.play();
            } else {
                music.pause();
            }
        }, (hovered) => {
            var clr = hovered ? 'white' : 'rgba(255,255,255,0.8)',
                status = music.paused ? 'Off' : 'On';

            Utilities.drawRect(x - w / 4 + 1, y, w / 4 + 1, h / 2 - 1, clr, '', 0, context);
            var path = new Path2D();
            path.moveTo(x - 1, y - h / 4);
            path.lineTo(x + w / 4, y - h / 2 + 1);
            path.lineTo(x + w / 4, y + h / 2 - 1);
            path.lineTo(x - 1, y + h / 4);
            path.closePath();
            context.fillStyle = clr;
            context.fill(path);

            if (music.paused) {
                Utilities.drawLine(x - w / 2, y + h / 2, x + w / 2, y - h / 2, "red", 2, context);
                status = "Off";
            }

            if (hovered) {
                Utilities.drawText({
                    x,
                    y: y + w / 2 + 2,
                    text: 'Music: ' + status,
                    font: '10px monospace',
                    align: 'center',
                    baseline: 'top',
                    color: '#fff'
                }, context);
            }
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