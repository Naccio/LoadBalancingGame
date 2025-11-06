/// <reference path='Button.ts' />

class BorderButton implements Button {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        private color: string,
        private hoverColor: string,
        private borderWidth: number,
        public onClick: () => void
    ) { }

    public draw(hovered: boolean, context: CanvasRenderingContext2D) {
        const color = hovered ? this.hoverColor : this.color;

        Utilities.drawRect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            borderColor: color,
            borderWidth: this.borderWidth
        }, context);
    }
}