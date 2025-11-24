/// <reference path='Model/Vector.ts' />
/// <reference path='VectorMath.ts' />

class VectorCalculator {
    constructor (private v: Vector) {
    }

    public get x() {
        return this.v.x;
    }

    public get y() {
        return this.v.y;
    }

    public add(v: Vector) {
        return VectorMath.add(this, v);
    }

    public angle(v: Vector) {
        return VectorMath.angle(this, v);
    }

    public clamp(min: number, max: number) {
        return VectorMath.clamp(this, min, max);
    }

    public direction(v: Vector) {
        return VectorMath.direction(this, v);
    }

    public divide(n: number) {
        return VectorMath.divide(this, n);
    }

    public dotProduct(v: Vector) {
        return VectorMath.dotProduct(this, v);
    }

    public invert() {
        return VectorMath.invert(this);
    }

    public isEqual(v: Vector) {
        return VectorMath.isEqual(this, v);
    }

    public magnitude() {
        return VectorMath.magnitude(this);
    }

    public multiply(n: number) {
        return VectorMath.multiply(this, n);
    }

    public normalize() {
        return VectorMath.normalize(this);
    }

    public rotate(rad: number) {
        return VectorMath.rotate(this, rad);
    }

    public round(places: number) {
        return VectorMath.round(this, places);
    }

    public subtract(v: Vector) {
        return VectorMath.subtract(this, v)
    }
}