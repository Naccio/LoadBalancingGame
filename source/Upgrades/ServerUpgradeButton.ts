/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class ServerUpgradeButton extends UpgradeButton {
    constructor(x: number, y: number, onClick?: () => void) {
        super(x, y, 'Buy new datacenter', onClick)
    }

    drawIcon(canvas: Canvas) {
        const x = this.x,
            y = this.y;

        canvas.drawText({
            x: x - 25,
            y,
            text: '+',
            fontSize: 45,
            align: 'center',
            color: Defaults.accentColor
        });
        Utilities.drawServer(new Server(x + 15, y), {
            ...Defaults.serverDisabledDefaults,
            borderColor: Defaults.accentColor
        }, canvas);
    }
}