/// <reference path='../Model/Point.ts' />
/// <reference path='Shape.ts' />

interface Polygon extends Shape {
    points: [Point, Point, Point, ...Point[]];
}