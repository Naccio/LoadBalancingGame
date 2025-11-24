/// <reference path="../Graphics/Canvas.ts" />
/// <reference path="Button.ts" />

abstract class SettingButton implements Button {
    public readonly width: number;
    public readonly height: number;

    constructor(public position: Point, protected size: number, private text: string) {
        this.width = size;
        this.height = size;
    }

    protected abstract get isOn(): boolean;

    public draw(hovered: boolean, canvas: Canvas) {
        const p = this.position,
            w = this.width,
            h = this.height;

        if (!this.isOn) {
            canvas.drawLine({
                from: {
                    x: p.x - w / 2,
                    y: p.y + h / 2
                },
                to: {
                    x: p.x + w / 2,
                    y: p.y - h / 2
                },
                color: Defaults.accentColor,
                width: 2
            });
        }

        if (hovered) {
            canvas.drawText({
                position: {
                    x: p.x,
                    y: p.y + w / 2 + 4
                },
                text: this.text,
                fontSize: 8,
                align: 'center',
                baseline: 'top',
                color: Defaults.primaryColor
            });
        }
    }

    public abstract onClick(): void;
}