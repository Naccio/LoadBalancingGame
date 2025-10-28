class Utilities {

    public static drawCircle(x: number, y: number, r: number, c: string, bc: string, bw: number, context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (bc) {
            Utilities.drawCircleBorder(x, y, r, bc, bw, context);
        }
        context.fillStyle = c;
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    public static drawCircleBorder(x: number, y: number, r: number, c: string, bw: number, context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (!bw) {
            bw = 1;
        }
        context.strokeStyle = c;
        context.lineWidth = bw;
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2, true);
        context.closePath();
        context.stroke();
    }

    public static drawLine(x1: number, y1: number, x2: number, y2: number, c: string, w: number, context: CanvasRenderingContext2D) {
        if (!w) {
            w = 1;
        }
        context.strokeStyle = c;
        context.lineWidth = w;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    // x, y = center
    public static drawRectBorder(
        x: number,
        y: number,
        w: number,
        h: number,
        c: string,
        bw: number,
        context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (!bw) {
            bw = 1;
        }
        context.strokeStyle = c;
        context.lineWidth = bw;
        context.strokeRect(x - w / 2 - bw / 2, y - h / 2 - bw / 2, w + bw, h + bw);
    }

    // x, y = center
    public static drawRect(
        x: number,
        y: number,
        w: number,
        h: number,
        c: string | CanvasGradient,
        bc: string,
        bw: number,
        context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (bc) {
            Utilities.drawRectBorder(x, y, w, h, bc, bw, context);
        }
        context.fillStyle = c;
        context.beginPath();
        context.rect(x - w / 2, y - h / 2, w, h);
        context.closePath();
        context.fill();
    }

    public static drawSky(canvas: HTMLCanvasElement, $clouds: any) {
        const context = canvas.getContext('2d')!,
            w = canvas.width,
            h = canvas.height;

        Utilities.drawRect(w / 2, h / 2, w, h, '#0360AE', '', 0, context);
        $clouds.draw(context);
    }

    public static drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, c: string, bc: string, bw: number, context: CanvasRenderingContext2D) {
        let rot = Math.PI / 2 * 3,
            x = cx,
            y = cy,
            step = Math.PI / spikes;

        context.beginPath();
        context.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i += 1) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }

        context.lineTo(cx, cy - outerRadius);
        context.closePath();
        if (bc && bw) {
            context.lineWidth = bw;
            context.strokeStyle = bc;
            context.stroke();
        }
        context.fillStyle = c;
        context.fill();
    }

    public static drawText(
        x: number,
        y: number,
        text: string,
        font: string,
        align: CanvasTextAlign,
        baseline: CanvasTextBaseline,
        color: string,
        context: CanvasRenderingContext2D
    ) {
        context.font = font;
        context.textAlign = align;
        context.textBaseline = baseline;
        context.fillStyle = color;
        context.fillText(text, x, y);
    }

    public static drawTriangle(x: number, y: number, b: number, h: number, c: string, bc: string, bw: number, context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (bc) {
            Utilities.drawTriangleBorder(x, y, b, h, bc, bw, context);
        }
        var path = new Path2D();
        path.moveTo(x, y - h / 2);
        path.lineTo(x + b / 2, y + h / 2);
        path.lineTo(x - b / 2, y + h / 2);
        context.fillStyle = c;
        context.fill(path);
    }

    public static drawTriangleBorder(x: number, y: number, b: number, h: number, c: string, bw: number, context: CanvasRenderingContext2D) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (!bw) {
            bw = 1;
        }
        var path = new Path2D();
        path.moveTo(x, y - h / 2);
        path.lineTo(x + b / 2, y + h / 2);
        path.lineTo(x - b / 2, y + h / 2);
        path.closePath();
        context.strokeStyle = c;
        context.lineWidth = bw;
        context.stroke(path);
    }

    public static getDistance(x1: number, y1: number, x2: number, y2: number) {
        var xs = x2 - x1,
            ys = y2 - y1;

        return Math.sqrt(Math.pow(xs, 2) + Math.pow(ys, 2));
    }

    //must be string containing hex value ("#xxxxxx")
    public static invertColor(color: string) {
        color = color.substring(1);
        let colorNumber = parseInt(color, 16);
        colorNumber = 0xFFFFFF ^ colorNumber;
        color = colorNumber.toString(16);
        color = ('000000' + color).slice(-6);
        color = '#' + color;
        return color;
    }
}