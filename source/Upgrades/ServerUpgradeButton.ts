/// <reference path='../Defaults.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class ServerUpgradeButton extends UpgradeButton {
    constructor(x: number, y: number, onClick?: () => void) {
        super(x, y, 'Buy new datacenter', onClick)
    }

    drawIcon(context: CanvasRenderingContext2D) {
        const x = this.x,
            y = this.y,
            serverSize = Defaults.serverSize;

        Utilities.drawText({
            x: x - 25,
            y,
            text: '+',
            fontSize: 45,
            align: 'center',
            color: Defaults.accentColor
        }, context);
        Utilities.drawRect({
            x: x + 15,
            y,
            width: serverSize,
            height: serverSize,
            color: '#DDDDDD',
            borderColor: Defaults.accentColor
        }, context);
        Utilities.drawStar({
            x: x - serverSize / 2 + 22,
            y: y + serverSize / 2 - 9,
            outerRadius: 4,
            innerRadius: 2,
            color: '#BBBBBB',
            borderColor: '#999999'
        }, context);
        Utilities.drawRect({
            x: x + serverSize / 2 + 8,
            y: y + 1,
            width: 6,
            height: serverSize - 10,
            color: '#BBBBBB',
            borderColor: '#999999'
        }, context);
    }
}