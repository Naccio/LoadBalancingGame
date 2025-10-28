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
        let color;
        if (!hovered) {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.color, this.borderWidth, context);
            color = this.color;
        } else {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.hoverColor, this.borderWidth, context);
            color = this.hoverColor;
        }
        Utilities.drawText(this.x, this.y, this.text, '15px monospace', 'center', 'middle', color, context);
    }
}