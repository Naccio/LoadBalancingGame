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

    draw(hovered: boolean, context: CanvasRenderingContext2D) {
        const x = this.x,
            y = this.y,
            w = this.width,
            h = this.height,
            color = hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent,
            status = this.isOn ? 'On' : 'Off';

        Utilities.drawRect({
            x: x - w / 4 + 1,
            y,
            width: w / 4 + 1,
            height: h / 2 - 1,
            color
        }, context);
        var path = new Path2D();
        path.moveTo(x - 1, y - h / 4);
        path.lineTo(x + w / 4, y - h / 2 + 1);
        path.lineTo(x + w / 4, y + h / 2 - 1);
        path.lineTo(x - 1, y + h / 4);
        path.closePath();
        context.fillStyle = color;
        context.fill(path);

        if (!this.isOn) {
            Utilities.drawLine({
                x1: x - w / 2,
                y1: y + h / 2,
                x2: x + w / 2,
                y2: y - h / 2,
                color: Defaults.accentColor,
                width: 2
            }, context);
        }

        if (hovered) {
            Utilities.drawText({
                x,
                y: y + w / 2 + 2,
                text: 'Music: ' + status,
                fontSize: 10,
                align: 'center',
                baseline: 'top',
                color: Defaults.primaryColor
            }, context);
        }
    }
}