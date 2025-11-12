/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Button.ts' />

class VolumeButton implements Button {
    public width: number;
    public height: number;
    public isOn = false;

    constructor(public position: Point, size: number, public onClick: () => void) {
        this.width = size;
        this.height = size;
    }

    draw(hovered: boolean, canvas: Canvas) {
        const p = this.position,
            w = this.width,
            h = this.height,
            color = hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent,
            status = this.isOn ? 'On' : 'Off';

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

        if (!this.isOn) {
            canvas.drawLine({
                from: {
                    x: p.x - w / 2,
                    y: p.y + h / 2
                },
                to: {
                    x: p.x + w / 2,
                    y: p.y - h / 2
                },
                color: Defaults.accentColor,
                width: 2
            });
        }

        if (hovered) {
            canvas.drawText({
                position: {
                    x: p.x,
                    y: p.y + w / 2 + 2
                },
                text: 'Music: ' + status,
                fontSize: 10,
                align: 'center',
                baseline: 'top',
                color: Defaults.primaryColor
            });
        }
    }
}