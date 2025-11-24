/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class CapacityUpgradeButton extends UpgradeButton {
    constructor(position: Point, onClick?: () => void) {
        super(position, 'Scale off at one location', onClick);
    }

    drawIcon(canvas: Canvas) {
        const p = this.position,
            serverSize = Defaults.serverSize;

        var queueX = p.x + serverSize / 2 - 7,
            queueY = p.y + 1,
            color = Defaults.accentColor,
            lineWidth = 3;
        Utilities.drawServer(new Server(p), {
            ...Defaults.serverDisabledDefaults,
            queueColor: Defaults.accentColorMuted,
            queueBorderColor: Defaults.accentColor
        }, canvas);
        canvas.drawArrow({
            from: {
                x: queueX,
                y: queueY - serverSize / 2 + 2
            },
            to: {
                x: queueX,
                y: queueY - serverSize / 2 - 13
            },
            color,
            width: lineWidth
        });
    }
}