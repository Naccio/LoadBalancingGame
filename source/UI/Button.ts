class Button {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public text: string,
        public color: string,
        public onClick: () => void) { }

    public draw(hovered: boolean, context: CanvasRenderingContext2D) {
        let color;
        if (hovered) {
            Utilities.drawRect(this.x, this.y, this.width, this.height, this.color, this.color, 2, context);
            color = Utilities.invertColor(this.color);
        } else {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.color, 2, context);
            color = this.color;
        }
        Utilities.drawText(this.x, this.y, this.text, '15px monospace', 'center', 'middle', color, context);
    };
}