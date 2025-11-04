/// <reference path='../Utilities.ts' />
/// <reference path='SimpleButton.ts' />

class SpecialButton extends SimpleButton {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        public hoverColor: string,
        public borderWidth: number,
        onClick: () => void,
        private specialDraw: (h: boolean, c: CanvasRenderingContext2D) => void) {
        super(x, y, width, height, '', color, onClick)
    }

    public draw(hovered: boolean, context: CanvasRenderingContext2D) {
        Utilities.drawRect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: this.color,
            borderColor: hovered ? this.hoverColor : undefined
        }, context);

        this.specialDraw(hovered, context);
    };
}