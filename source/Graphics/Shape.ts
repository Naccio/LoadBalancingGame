/// <reference path='../Model/GameObject.ts' />

interface Shape extends GameObject {
    color?: string | CanvasGradient,
    borderColor?: string,
    borderWidth?: number
}