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
    private scale = 0;

    public readonly width = 800;
    public readonly height = 600;

    constructor(private canvasElement: HTMLCanvasElement) {
        const context = canvasElement.getContext('2d');

        if (!context) {
            throw 'Could not get 2D context from canvas';
        }

        window.addEventListener('resize', () => this.resize());

        this.context = context;
        this.resize();
    }

    public get center(): Point {
        return {
            x: this.width / 2,
            y: this.height / 2
        }
    }

    public clear() {
        const width = this.getActualMeasure(this.width),
            height = this.getActualMeasure(this.height);

        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0, 0, width, height);
    }

    //TODO: Leaky abstraction
    public createLinearGradient(x1: number, y1: number, x2: number, y2: number) {
        x1 = this.getActualMeasure(x1);
        y1 = this.getActualMeasure(y1);
        x2 = this.getActualMeasure(x2);
        y2 = this.getActualMeasure(y2);

        return this.context.createLinearGradient(x1, y1, x2, y2);
    }

    public drawArrow(arrow: Arrow) {
        const context = this.context,
            from = this.getActualPosition(arrow.from),
            to = this.getActualPosition(arrow.to),
            barbsAngle = arrow.barbsAngle ?? Math.PI / 5,
            barbsLength = this.getActualMeasure(arrow.barbsLength ?? 8),
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
            p = this.getActualPosition(circle.position),
            r = this.getActualMeasure(circle.radius);

        context.beginPath();
        context.arc(p.x, p.y, r, 0, Math.PI * 2, true);
        context.closePath();

        this.draw(circle);
    }

    public drawLine(line: Line) {
        const context = this.context,
            from = this.getActualPosition(line.from),
            to = this.getActualPosition(line.to);

        context.strokeStyle = line?.color ?? Defaults.defaultColor;
        context.lineWidth = this.getActualMeasure(line?.width ?? 1);
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
    }

    public drawPolygon(polygon: Polygon) {
        const context = this.context,
            points = [...polygon.points],
            start = this.getActualPosition(points.shift()!);

        context.beginPath();
        context.moveTo(start.x, start.y);
        points.forEach(p => {
            p = this.getActualPosition(p);
            context.lineTo(p.x, p.y);
        });
        context.closePath();

        this.draw(polygon);
    }

    public drawRect(rectangle: Rectangle) {
        const context = this.context,
            p = this.getActualPosition(rectangle.position),
            w = this.getActualMeasure(rectangle.width),
            h = this.getActualMeasure(rectangle.height);

        context.beginPath();
        context.rect(p.x - w / 2, p.y - h / 2, w, h);
        context.closePath();

        this.draw(rectangle);
    }

    public drawStar(star: Star) {
        const context = this.context,
            center = this.getActualPosition(star.position),
            spikes = star.spikes ?? 5,
            outerRadius = this.getActualMeasure(star.outerRadius),
            innerRadius = this.getActualMeasure(star.innerRadius),
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
            p = this.getActualPosition(text.position),
            fontSize = this.getActualMeasure(text.fontSize),
            fontFamily = text.fontFamily ?? 'monospace';

        let font = `${fontSize}px ${fontFamily}`;

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
            p = this.getActualPosition(triangle.position),
            x = p.x,
            y = p.y,
            b = this.getActualMeasure(triangle.base),
            h = this.getActualMeasure(triangle.height);

        context.beginPath();
        context.moveTo(x, y - h / 2);
        context.lineTo(x + b / 2, y + h / 2);
        context.lineTo(x - b / 2, y + h / 2);

        this.draw(triangle);
    }

    public getActualMeasure(value: number) {
        return Math.floor(value * this.scale);
    }

    public getActualPosition(point: Point) {
        return VectorMath.multiply(point, this.scale).round(0);
    }

    public getRelativePosition(point: Point) {
        const offset = {
            x: this.canvasElement.offsetLeft,
            y: this.canvasElement.offsetTop
        }
        return VectorMath.subtract(point, offset).divide(this.scale);
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

    private resize() {
        const scale = Math.min(window.innerWidth / this.width, window.innerHeight / this.height);

        this.scale = scale;
        this.canvasElement.width = this.getActualMeasure(this.width);
        this.canvasElement.height = this.getActualMeasure(this.height);
    }
}