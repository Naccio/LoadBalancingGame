/// <reference path='../Model/GameObject.ts' />

interface UIText extends GameObject {
    text: string,
    fontSize: number,
    fontFamily?: string,
    fontVariant?: CanvasFontVariantCaps
    fontWeight?: 'bold' | 'normal',
    align?: CanvasTextAlign,
    baseline?: CanvasTextBaseline,
    color?: string,
}