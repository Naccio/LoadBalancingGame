/// <reference path='../UI/Button.ts' />
/// <reference path='../Utilities.ts' />

abstract class UpgradeButton implements Button {
    public width: number;
    public height: number;

    constructor(public x: number, public y: number, private text: string, onClick?: () => void) {
        this.width = 100;
        this.height = 100;

        if (onClick) {
            this.onClick = onClick;
        }
    }

    onClick() { }

    abstract drawIcon(context: CanvasRenderingContext2D): void;

    draw(hovered: boolean, context: CanvasRenderingContext2D) {
        Utilities.drawRect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: '#333333',
            borderColor: hovered ? 'white' : undefined,
            borderWidth: 2
        }, context);

        this.drawIcon(context);

        if (hovered) {
            Utilities.drawText({
                x: context.canvas.width / 2,
                y: context.canvas.height - 50,
                text: this.text,
                fontSize: 20,
                align: 'center',
                color: 'red'
            }, context);
        }
    }
}