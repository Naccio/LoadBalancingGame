/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Utilities.ts' />
/// <reference path='Button.ts' />

class SimpleButton implements Button {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public text: string,
        public color: string,
        public onClick: () => void) { }

    public draw(hovered: boolean, canvas: Canvas) {
        const color = hovered ? Utilities.invertColor(this.color) : this.color;

        canvas.drawRect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: hovered ? this.color : undefined,
            borderColor: this.color,
            borderWidth: 2
        });
        canvas.drawText({
            x: this.x,
            y: this.y,
            text: this.text,
            fontSize: 15,
            align: 'center',
            color
        });
    };
}