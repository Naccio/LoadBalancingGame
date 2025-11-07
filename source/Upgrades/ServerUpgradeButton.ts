/// <reference path='../Defaults.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class ServerUpgradeButton extends UpgradeButton {
    constructor(x: number, y: number, onClick?: () => void) {
        super(x, y, 'Buy new datacenter', onClick)
    }

    drawIcon(context: CanvasRenderingContext2D) {
        const x = this.x,
            y = this.y;

        Utilities.drawText({
            x: x - 25,
            y,
            text: '+',
            fontSize: 45,
            align: 'center',
            color: Defaults.accentColor
        }, context);
        Utilities.drawServer(new Server(x + 15, y), {
            ...Defaults.serverDisabledDefaults,
            borderColor: Defaults.accentColor
        }, context);
    }
}