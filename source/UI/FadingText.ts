/// <reference path='Color.ts' />

interface FadingText {
    text: string;
    color: Color;
    fontSize: number;
    fontWeight: string;
    border: boolean;
    borderColor: Color;
    borderWidth: number;
    life?: number;
    fadeIn?: boolean;
    alpha: number;
    font: string;
    delta: number;
    id?: string;
    x?: number;
    y?: number;
}