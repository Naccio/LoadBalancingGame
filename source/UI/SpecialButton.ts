class SpecialButton {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public color: string,
        public hoverColor: string,
        public borderWidth: number,
        public onClick: () => void,
        private specialDraw: (h: boolean) => void) { }

    public draw(hovered: boolean, context: CanvasRenderingContext2D) {
        Utilities.drawRect(this.x, this.y, this.width, this.height, this.color, '', 0, context);

        if (hovered) {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.hoverColor, this.borderWidth, context);
        }

        this.specialDraw(hovered);
    };
}