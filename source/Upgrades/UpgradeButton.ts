/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../Utilities.ts' />

abstract class UpgradeButton implements Button {
    public width: number;
    public height: number;

    constructor(public position: Point, private text: string, onClick?: () => void) {
        this.width = 100;
        this.height = 100;

        if (onClick) {
            this.onClick = onClick;
        }
    }

    onClick() { }

    abstract drawIcon(context: Canvas): void;

    draw(hovered: boolean, canvas: Canvas) {
        canvas.drawRect({
            position: this.position,
            width: this.width,
            height: this.height,
            color: Defaults.secondaryColor,
            borderColor: hovered ? Defaults.primaryColor : undefined,
            borderWidth: 2
        });

        this.drawIcon(canvas);

        if (hovered) {
            canvas.drawText({
                position: {
                    x: canvas.width / 2,
                    y: canvas.height - 50
                },
                text: this.text,
                fontSize: 20,
                align: 'center',
                color: Defaults.accentColor
            });
        }
    }
}