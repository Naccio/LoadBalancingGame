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
            color = Defaults.accentColor,
            lineWidth = 3;
        Utilities.drawServer(new Server(x, y), {
            ...Defaults.serverDisabledDefaults,
            queueColor: Defaults.accentColorMuted,
            queueBorderColor: Defaults.accentColor
        }, context);
        Utilities.drawArrow({
            x1: queueX,
            y1: queueY - serverSize / 2 + 2,
            x2: queueX,
            y2: queueY - serverSize / 2 - 13,
            color,
            width: lineWidth
        }, context);
    }
}