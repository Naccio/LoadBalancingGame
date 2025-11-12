/// <reference path='MathHelper.ts' />
/// <reference path='Model/Vector.ts' />

class VectorMath {
    public static readonly zero = {
        x: 0,
        y: 0
    };

    public static add(v1: Vector, v2: Vector) {
        return new VectorCalculator({
            x: v1.x + v2.x,
            y: v1.y + v2.y
        });
    }

    public static angle(v1: Vector, v2: Vector) {
        v1 = this.normalize(v1);
        v2 = this.normalize(v2);

        return Math.acos(this.dotProduct(v1, v2));
    }

    public static clamp(v: Vector, min: number, max: number) {
        return new VectorCalculator({
            x: MathHelper.clamp(v.x, min, max),
            y: MathHelper.clamp(v.y, min, max)
        });
    }

    public static direction(v1: Vector, v2: Vector) {
        return this.subtract(v2, v1).normalize();
    }

    public static distance(v1: Vector, v2: Vector) {
        const d = this.subtract(v2, v1);

        return Math.sqrt(Math.pow(d.x, 2) + Math.pow(d.y, 2));
    }

    public static divide(v: Vector, number: number) {
        return new VectorCalculator({
            x: v.x / number,
            y: v.y / number
        });
    }

    public static dotProduct(v1: Vector, v2: Vector) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    public static hadamardProduct(v1: Vector, v2: Vector) {
        return new VectorCalculator({
            x: v1.x * v2.x,
            y: v1.y * v2.y
        });
    }

    public static invert(v: Vector) {
        return this.multiply(v, -1);
    }

    public static isEqual(v1: Vector, v2: Vector) {
        return v1.x === v2.x && v1.y === v2.y;
    }

    public static magnitude(v: Vector) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    public static multiply(v: Vector, number: number) {
        return new VectorCalculator({
            x: v.x * number,
            y: v.y * number
        });
    }

    public static normalize(v: Vector) {
        const m = this.magnitude(v);

        return this.divide(v, m);
    }

    public static rotate(v: Vector, rad: number) {
        const cos = Math.cos(rad),
            sin = Math.sin(rad);
            
        return new VectorCalculator({
            x: cos * v.x - sin * v.y,
            y: sin * v.x + cos * v.y
        });
    }

    public static round(v: Vector, decimalPlaces: number) {
        return new VectorCalculator({
            x: MathHelper.round(v.x, decimalPlaces),
            y: MathHelper.round(v.y, decimalPlaces)
        });
    }

    public static shift(v: Vector, direction: number, magnitude: number) {
        return new VectorCalculator({
            x: v.x + Math.cos(direction) * magnitude,
            y: v.y + Math.sin(direction) * magnitude
        });
    }

    public static subtract(v1: Vector, v2: Vector) {
        return new VectorCalculator({
            x: v1.x - v2.x,
            y: v1.y - v2.y
        });
    }
}