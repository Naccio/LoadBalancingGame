/// <reference path='../Graphics/Canvas.ts' />

interface Button {
    x: number,
    y: number,
    width: number,
    height: number,
    draw: (hovered: boolean, canvas: Canvas) => void;
    onClick: () => void
}