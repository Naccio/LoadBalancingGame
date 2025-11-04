interface Button {
    x: number,
    y: number,
    width: number,
    height: number,
    draw: (hovered: boolean, context: CanvasRenderingContext2D) => void;
    onClick: () => void
}