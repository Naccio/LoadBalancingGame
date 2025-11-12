/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='Button.ts' />

class BorderButton implements Button {
    constructor(
        public position: Point,
        public width: number,
        public height: number,
        private color: string,
        private hoverColor: string,
        private borderWidth: number,
        public onClick: () => void
    ) { }

    public draw(hovered: boolean, canvas: Canvas) {
        const color = hovered ? this.hoverColor : this.color;

        canvas.drawRect({
            position: this.position,
            width: this.width,
            height: this.height,
            borderColor: color,
            borderWidth: this.borderWidth
        });
    }
}