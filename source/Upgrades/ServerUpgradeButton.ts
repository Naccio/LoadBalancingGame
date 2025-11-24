/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='UpgradeButton.ts' />

class ServerUpgradeButton extends UpgradeButton {
    constructor(position: Point, onClick?: () => void) {
        super(position, 'Buy new datacenter', onClick)
    }

    drawIcon(canvas: Canvas) {
        const p = this.position;

        canvas.drawText({
            position: {
                x: p.x - 25,
                y: p.y
            },
            text: '+',
            fontSize: 45,
            align: 'center',
            color: Defaults.accentColor
        });
        Utilities.drawServer(new Server({
            x: p.x + 15,
            y: p.y
        }), {
            ...Defaults.serverDisabledDefaults,
            borderColor: Defaults.accentColor
        }, canvas);
    }
}