/// <reference path='../Defaults.ts' />
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
            x1 = arrow.x1,
            y1 = arrow.y1,
            x2 = arrow.x2,
            y2 = arrow.y2,
            angle = Math.atan2(y2 - y1, x2 - x1),
            inverseAngle = Math.PI - angle,
            barbsAngle = arrow.barbsAngle ?? Math.PI / 5,
            barbsLength = arrow.barbsLength ?? 8,
            rightBarbAngle = barbsAngle - inverseAngle,
            leftBarbAngle = -barbsAngle - inverseAngle,
            rightBarbX = x2 + Math.cos(rightBarbAngle) * barbsLength,
            rightBarbY = y2 + Math.sin(rightBarbAngle) * barbsLength,
            leftBarbX = x2 + Math.cos(leftBarbAngle) * barbsLength,
            leftBarbY = y2 + Math.sin(leftBarbAngle) * barbsLength;

        context.strokeStyle = arrow?.color ?? Defaults.defaultColor;
        context.lineWidth = arrow?.width ?? 1;
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(rightBarbX, rightBarbY);
        context.moveTo(x2, y2);
        context.lineTo(leftBarbX, leftBarbY);
        context.stroke();
    }

    public drawCircle(circle: Circle) {
        const context = this.context;

        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
        context.closePath();

        this.draw(circle);
    }

    public drawLine(line: Line) {
        const context = this.context;

        context.strokeStyle = line?.color ?? Defaults.defaultColor;
        context.lineWidth = line?.width ?? 1;
        context.beginPath();
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }

    public drawPolygon(polygon: Polygon) {
        const context = this.context,
            points = polygon.points,
            start = points.shift()!;

        context.beginPath();
        context.moveTo(start.x, start.y);
        points.forEach(p => context.lineTo(p.x, p.y));
        context.closePath();

        this.draw(polygon);
    }

    public drawRect(rectangle: Rectangle) {
        const context = this.context,
            x = rectangle.x,
            y = rectangle.y,
            w = rectangle.width,
            h = rectangle.height;

        context.beginPath();
        context.rect(x - w / 2, y - h / 2, w, h);
        context.closePath();

        this.draw(rectangle);
    }

    public drawStar(star: Star) {
        const context = this.context,
            centerX = star.x,
            centerY = star.y,
            spikes = star.spikes ?? 5,
            outerRadius = star.outerRadius,
            innerRadius = star.innerRadius,
            step = Math.PI / spikes;

        let x, y,
            rot = Math.PI / 2 * 3;

        context.beginPath();
        context.moveTo(centerX, centerY - outerRadius);
        for (let i = 0; i < spikes; i += 1) {
            x = centerX + Math.cos(rot) * outerRadius;
            y = centerY + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;

            x = centerX + Math.cos(rot) * innerRadius;
            y = centerY + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }

        context.lineTo(centerX, centerY - outerRadius);
        context.closePath();

        this.draw(star);
    }

    public drawText(text: UIText) {
        const context = this.context,
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
        context.fillText(text.text, text.x, text.y);
    }

    public drawTriangle(triangle: Triangle) {
        const context = this.context,
            x = triangle.x,
            y = triangle.y,
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