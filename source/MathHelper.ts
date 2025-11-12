class MathHelper {

    public static clamp(number: number, min: number, max: number) {
        return Math.min(Math.max(number, min), max);
      }

    public static nearestPower(x: number, base: number) {
        return Math.pow(base, this.nearestRoot(x, base));
    }

    public static nearestRoot(x: number, degree: number) {
        // log_b(x) == log(x) / log(b)
        return Math.ceil(Math.log(x) / Math.log(degree));
    }

    public static random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    public static randomInt(min: number, max: number) {
        return Math.floor(MathHelper.random(min, max));
    }

    public static round(number: number, decimalPlaces: number) {
        const multiplier = Math.pow(10, decimalPlaces);

        return Math.round(number * multiplier) / multiplier;
    }
}