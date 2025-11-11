/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Button.ts' />

class VolumeButton implements Button {
    public width: number;
    public height: number;
    public isOn = false;

    constructor(public x: number, public y: number, size: number, public onClick: () => void) {
        this.width = size;
        this.height = size;
    }

    draw(hovered: boolean, canvas: Canvas) {
        const x = this.x,
            y = this.y,
            w = this.width,
            h = this.height,
            color = hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent,
            status = this.isOn ? 'On' : 'Off';

        canvas.drawRect({
            x: x - w / 4 + 1,
            y,
            width: w / 4 + 1,
            height: h / 2 - 1,
            color
        });
        canvas.drawPolygon({
            x,
            y,
            points: [{
                x: x - 1,
                y: y - h / 4
            }, {
                x: x + w / 4,
                y: y - h / 2 + 1
            }, {
                x: x + w / 4,
                y: y + h / 2 - 1
            }, {
                x: x - 1,
                y: y + h / 4
            }],
            color
        });

        if (!this.isOn) {
            canvas.drawLine({
                x1: x - w / 2,
                y1: y + h / 2,
                x2: x + w / 2,
                y2: y - h / 2,
                color: Defaults.accentColor,
                width: 2
            });
        }

        if (hovered) {
            canvas.drawText({
                x,
                y: y + w / 2 + 2,
                text: 'Music: ' + status,
                fontSize: 10,
                align: 'center',
                baseline: 'top',
                color: Defaults.primaryColor
            });
        }
    }
}