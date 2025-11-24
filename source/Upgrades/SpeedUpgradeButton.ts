/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class SpeedUpgradeButton extends UpgradeButton {
    constructor(position: Point, onClick?: () => void) {
        super(position, 'Improve speed at one location', onClick)
    }

    drawIcon(canvas: Canvas) {
        const p = this.position,
            serverSize = Defaults.serverSize;

        var starX = p.x - serverSize / 2 + 7,
            starY = p.y + serverSize / 2 - 9,
            color = Defaults.accentColor,
            lineWidth = 3;

        Utilities.drawServer(new Server(p), {
            ...Defaults.serverDisabledDefaults,
            speedColor: Defaults.accentColorMuted,
            speedBorderColor: Defaults.accentColor
        }, canvas);
        canvas.drawArrow({
            from: {
                x: starX,
                y: starY - 6
            },
            to: {
                x: starX,
                y: starY - 21
            },
            color,
            width: lineWidth
        });
    }
}