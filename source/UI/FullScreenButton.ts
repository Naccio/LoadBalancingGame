/// <reference path="../VectorMath.ts" />
/// <reference path="SettingButton.ts" />

class FullScreenButton extends SettingButton {

    public constructor(position: Point, size: number, private target: HTMLElement) {
        super(position, size, 'Fullscreen');
    }

    protected get isOn() {
        return !!document.fullscreenElement;
    }

    public draw(hovered: boolean, canvas: Canvas) {
        const p = this.position,
            shift = this.size / 2 - 3,
            segmentLength = Math.floor(this.size / 4),
            topLeft = VectorMath.add(p, { x: -shift, y: -shift }),
            topRight = VectorMath.add(p, { x: shift, y: -shift }),
            bottomLeft = VectorMath.add(p, { x: -shift, y: shift }),
            bottomRight = VectorMath.add(p, { x: shift, y: shift }),
            line = {
                color: hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent,
                width: 2
            };

        canvas.drawLine({
            ...line,
            from: topLeft,
            to: topLeft.add({ x: 0, y: segmentLength })
        });
        canvas.drawLine({
            ...line,
            from: topLeft,
            to: topLeft.add({ x: segmentLength, y: 0 })
        });
        canvas.drawLine({
            ...line,
            from: topRight,
            to: topRight.add({ x: 0, y: segmentLength })
        });
        canvas.drawLine({
            ...line,
            from: topRight,
            to: topRight.add({ x: -segmentLength, y: 0 })
        });
        canvas.drawLine({
            ...line,
            from: bottomRight,
            to: bottomRight.add({ x: 0, y: -segmentLength })
        });
        canvas.drawLine({
            ...line,
            from: bottomRight,
            to: bottomRight.add({ x: -segmentLength, y: 0 })
        });
        canvas.drawLine({
            ...line,
            from: bottomLeft,
            to: bottomLeft.add({ x: 0, y: -segmentLength })
        });
        canvas.drawLine({
            ...line,
            from: bottomLeft,
            to: bottomLeft.add({ x: segmentLength, y: 0 })
        });

        super.draw(hovered, canvas);
    }

    public onClick() {
        if (this.isOn) {
            document.exitFullscreen();
        } else {
            this.target.requestFullscreen({ navigationUI: 'hide' });
        }
    }

}