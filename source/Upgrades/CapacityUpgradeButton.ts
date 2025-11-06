/// <reference path='../Defaults.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class CapacityUpgradeButton extends UpgradeButton {
    constructor(x: number, y: number, onClick?: () => void) {
        super(x, y, 'Scale off at one location', onClick);
    }

    drawIcon(context: CanvasRenderingContext2D) {
        const x = this.x,
            y = this.y,
            serverSize = Defaults.serverSize;

        var queueX = x + serverSize / 2 - 7,
            queueY = y + 1,
            starX = x - serverSize / 2 + 7,
            starY = y + serverSize / 2 - 9,
            color = Defaults.accentColor,
            lineWidth = 3;
        Utilities.drawRect({
            x,
            y,
            width: serverSize,
            height: serverSize,
            color: '#DDDDDD',
            borderColor: '#999999'
        }, context);
        Utilities.drawRect({
            x: queueX,
            y: queueY,
            width: 6,
            height: serverSize - 10,
            color: Defaults.accentColorMuted,
            borderColor: Defaults.accentColor
        }, context);
        Utilities.drawStar({
            x: starX,
            y: starY,
            outerRadius: 4,
            innerRadius: 2,
            color: '#BBBBBB',
            borderColor: '#999999'
        }, context);
        Utilities.drawLine({
            x1: queueX,
            y1: queueY - serverSize / 2 + 2,
            x2: queueX,
            y2: queueY - serverSize / 2 - 13,
            color,
            width: lineWidth
        }, context);
        Utilities.drawLine({
            x1: queueX - 1,
            y1: queueY - serverSize / 2 - 13,
            x2: queueX + 5,
            y2: queueY - serverSize / 2 - 6,
            color,
            width: lineWidth
        }, context);
        Utilities.drawLine({
            x1: queueX + 1,
            y1: queueY - serverSize / 2 - 13,
            x2: queueX - 5,
            y2: queueY - serverSize / 2 - 6,
            color,
            width: lineWidth
        }, context);
    }
}