class BorderButton {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public text: string,
        public color: string,
        public hoverColor: string,
        public borderWidth: number,
        public onClick: () => {}) { }

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