/// <reference path='../Defaults.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class SpeedUpgradeButton extends UpgradeButton {
    constructor(x: number, y: number, onClick?: () => void) {
        super(x, y, 'Improve speed at one location', onClick)
    }

    drawIcon(context: CanvasRenderingContext2D) {
        const x = this.x,
            y = this.y,
            serverSize = Defaults.serverSize;

        var starX = x - serverSize / 2 + 7,
            starY = y + serverSize / 2 - 9,
            color = Defaults.accentColor,
            lineWidth = 3;

        Utilities.drawServer(new Server(x, y), {
            ...Defaults.serverDisabledDefaults,
            speedColor: Defaults.accentColorMuted,
            speedBorderColor: Defaults.accentColor
        }, context);
        Utilities.drawLine({
            x1: starX,
            y1: starY - 8,
            x2: starX,
            y2: starY - 21,
            color,
            width: lineWidth
        }, context);
        Utilities.drawLine({
            x1: starX - 1,
            y1: starY - 21,
            x2: starX + 5,
            y2: starY - 14,
            color,
            width: lineWidth
        }, context);
        Utilities.drawLine({
            x1: starX + 1,
            y1: starY - 21,
            x2: starX - 5,
            y2: starY - 14,
            color,
            width: lineWidth
        }, context);
    }
}