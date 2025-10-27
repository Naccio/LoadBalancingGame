class SpecialButton extends Button {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        public hoverColor: string,
        public borderWidth: number,
        onClick: () => void,
        private specialDraw: (h: boolean) => void) {
        super(x, y, width, height, '', color, onClick)
    }

    public draw(hovered: boolean, context: CanvasRenderingContext2D) {
        Utilities.drawRect(this.x, this.y, this.width, this.height, this.color, '', 0, context);

        if (hovered) {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.hoverColor, this.borderWidth, context);
        }

        this.specialDraw(hovered);
    };
}