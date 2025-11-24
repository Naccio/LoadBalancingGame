/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />

interface Button {
    position: Point,
    width: number,
    height: number,
    draw: (hovered: boolean, canvas: Canvas) => void;
    onClick: () => void
}