/// <reference path='Color.ts' />
/// <reference path='UIText.ts' />

interface FadingText extends UIText {
    rgbColor: Color;
    life?: number;
    fadeIn?: boolean;
    alpha: number;
    delta: number;
    id?: string;
}