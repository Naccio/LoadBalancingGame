/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='SettingButton.ts' />

class VolumeButton extends SettingButton {
    protected isOn = false;

    public constructor(position: Point, size: number, private target: HTMLAudioElement) {
        super(position, size, 'Music');
    }

    draw(hovered: boolean, canvas: Canvas) {
        const p = this.position,
            w = this.width,
            h = this.height,
            color = hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent;

        canvas.drawRect({
            position: {
                x: p.x - w / 4 + 1,
                y: p.y
            },
            width: w / 4 + 1,
            height: h / 2 - 1,
            color
        });
        canvas.drawPolygon({
            position: p,
            points: [{
                x: p.x - 1,
                y: p.y - h / 4
            }, {
                x: p.x + w / 4,
                y: p.y - h / 2 + 1
            }, {
                x: p.x + w / 4,
                y: p.y + h / 2 - 1
            }, {
                x: p.x - 1,
                y: p.y + h / 4
            }],
            color
        });

        super.draw(hovered, canvas);
    }

    public onClick() {
        const music = this.target;

        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
        this.isOn = !music.paused;
    }
}