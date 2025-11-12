/// <reference path='../Defaults.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../UI/UIText.ts' />
/// <reference path='Arrow.ts' />
/// <reference path='Circle.ts' />
/// <reference path='Line.ts' />
/// <reference path='Polygon.ts' />
/// <reference path='Rectangle.ts' />
/// <reference path='Star.ts' />
/// <reference path='Triangle.ts' />

class Canvas {
    private context: CanvasRenderingContext2D;

    constructor(private canvasElement: HTMLCanvasElement) {
        const context = canvasElement.getContext('2d');

        if (!context) {
            throw 'Could not get 2D context from canvas';
        }

        this.context = context;
    }

    public get center(): Point {
        return {
            x: this.width / 2,
            y: this.height / 2
        }
    }

    public get height() {
        return this.canvasElement.height;
    }

    public get width() {
        return this.canvasElement.width;
    }

    public clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    //TODO: Leaky abstraction
    public createLinearGradient(x1: number, y1: number, x2: number, y2: number) {
        return this.context.createLinearGradient(x1, y1, x2, y2);
    }

    public drawArrow(arrow: Arrow) {
        const context = this.context,
            from = arrow.from,
            to = arrow.to,
            barbsAngle = arrow.barbsAngle ?? Math.PI / 5,
            barbsLength = arrow.barbsLength ?? 8,
            direction = VectorMath.direction(to, from),
            rightBarb = direction.rotate(barbsAngle).multiply(barbsLength).add(to),
            leftBarb = direction.rotate(-barbsAngle).multiply(barbsLength).add(to);

        context.strokeStyle = arrow?.color ?? Defaults.defaultColor;
        context.lineWidth = arrow?.width ?? 1;
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.lineTo(rightBarb.x, rightBarb.y);
        context.moveTo(to.x, to.y);
        context.lineTo(leftBarb.x, leftBarb.y);
        context.stroke();
    }

    public drawCircle(circle: Circle) {
        const context = this.context,
            p = circle.position;

        context.beginPath();
        context.arc(p.x, p.y, circle.radius, 0, Math.PI * 2, true);
        context.closePath();

        this.draw(circle);
    }

    public drawLine(line: Line) {
        const context = this.context,
            from = line.from,
            to = line.to;

        context.strokeStyle = line?.color ?? Defaults.defaultColor;
        context.lineWidth = line?.width ?? 1;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
    }

    public drawPolygon(polygon: Polygon) {
        const context = this.context,
            points = [...polygon.points],
            start = points.shift()!;

        context.beginPath();
        context.moveTo(start.x, start.y);
        points.forEach(p => context.lineTo(p.x, p.y));
        context.closePath();

        this.draw(polygon);
    }

    public drawRect(rectangle: Rectangle) {
        const context = this.context,
            p = rectangle.position,
            w = rectangle.width,
            h = rectangle.height;

        context.beginPath();
        context.rect(p.x - w / 2, p.y - h / 2, w, h);
        context.closePath();

        this.draw(rectangle);
    }

    public drawStar(star: Star) {
        const context = this.context,
            center = star.position,
            spikes = star.spikes ?? 5,
            outerRadius = star.outerRadius,
            innerRadius = star.innerRadius,
            step = Math.PI / spikes;

        let rot = Math.PI / 2 * 3;

        context.beginPath();
        context.moveTo(center.x, center.y - outerRadius);
        for (let i = 0; i < spikes; i += 1) {
            const outer = VectorMath.shift(center, rot, outerRadius);
            context.lineTo(outer.x, outer.y);
            rot += step;

            const inner = VectorMath.shift(center, rot, innerRadius);
            context.lineTo(inner.x, inner.y);
            rot += step;
        }

        context.lineTo(center.x, center.y - outerRadius);
        context.closePath();

        this.draw(star);
    }

    public drawText(text: UIText) {
        const context = this.context,
            p = text.position,
            fontFamily = text.fontFamily ?? 'monospace';

        let font = `${text.fontSize}px ${fontFamily}`;

        if (text.fontVariant) {
            font = `${text.fontVariant} ${font}`;
        }

        if (text.fontWeight) {
            font = `${text.fontWeight} ${font}`;
        }

        context.font = font;
        context.textAlign = text.align ?? 'start';
        context.textBaseline = text.baseline ?? 'middle';
        context.fillStyle = text.color ?? Defaults.defaultColor;
        context.fillText(text.text, p.x, p.y);
    }

    public drawTriangle(triangle: Triangle) {
        const context = this.context,
            x = triangle.position.x,
            y = triangle.position.y,
            b = triangle.base,
            h = triangle.height;

        context.beginPath();
        context.moveTo(x, y - h / 2);
        context.lineTo(x + b / 2, y + h / 2);
        context.lineTo(x - b / 2, y + h / 2);

        this.draw(triangle);
    }

    private draw(shape: Shape) {
        const context = this.context;

        if (shape.color) {
            context.fillStyle = shape.color;
            context.fill();
        }
        if (shape.borderColor) {
            context.strokeStyle = shape.borderColor;
            context.lineWidth = shape.borderWidth ?? 1;
            context.stroke();
        }
    }
}