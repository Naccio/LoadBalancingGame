/// <reference path='Shape.ts' />

interface Polygon extends Shape {
    points: [{ x: number, y: number }, { x: number, y: number }, { x: number, y: number }, ...{ x: number, y: number }[]];
}