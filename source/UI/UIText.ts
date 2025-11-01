/// <reference path='../Model/GameObject.ts' />

interface UIText extends GameObject {
    text: string,
    font: string,
    align?: CanvasTextAlign,
    baseline?: CanvasTextBaseline,
    color?: string,
}