class BorderButton extends Button {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: string,
        public hoverColor: string,
        public borderWidth: number,
        onClick: () => void
    ) {
        super(x, y, width, height, text, color, onClick);
    }

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
        Utilities.drawText({
            x: this.x,
            y: this.y,
            text: this.text,
            font: '15px monospace',
            align: 'center',
            color
        }, context);
    }
}