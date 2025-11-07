/// <reference path='Model/ServerOptions.ts' />
/// <reference path='UI/Arrow.ts' />
/// <reference path='UI/Circle.ts' />
/// <reference path='UI/Line.ts' />
/// <reference path='UI/Rectangle.ts' />
/// <reference path='UI/Star.ts' />
/// <reference path='UI/Triangle.ts' />
/// <reference path='UI/UIText.ts' />

class Utilities {

    public static defaultButton(x: number, y: number, text: string, onClick: () => void) {
        return new SimpleButton(x, y, 120, 40, text, Defaults.primaryColor, onClick);
    }

    public static drawArrow(arrow: Arrow, context: CanvasRenderingContext2D) {
        const x1 = arrow.x1,
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

    public static drawCircle(circle: Circle, context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
        context.closePath();
        Utilities.draw(circle, context);
    }

    public static drawCircleHighlight(x: number, y: number, radius: number, context: CanvasRenderingContext2D) {
        const
            innerCircle = {
                x,
                y,
                radius,
                borderColor: 'fireBrick',
                borderWidth: 2
            },
            outerCircle = {
                ...innerCircle,
                radius: radius + 1,
                borderColor: 'red'
            };
        Utilities.drawCircle(innerCircle, context);
        Utilities.drawCircle(outerCircle, context);
    }

    public static drawLine(line: Line, context: CanvasRenderingContext2D) {
        context.strokeStyle = line?.color ?? Defaults.defaultColor;
        context.lineWidth = line?.width ?? 1;
        context.beginPath();
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }

    // x, y = center
    public static drawRect(rectangle: Rectangle, context: CanvasRenderingContext2D) {
        const x = rectangle.x,
            y = rectangle.y,
            w = rectangle.width,
            h = rectangle.height;

        context.beginPath();
        context.rect(x - w / 2, y - h / 2, w, h);
        context.closePath();
        Utilities.draw(rectangle, context);
    }

    public static drawServer(server: Server, options: ServerOptions, context: CanvasRenderingContext2D) {
        options = {
            ...Defaults.serverDefaults,
            ...options
        };
        const size = options.size!;

        let i = Math.max(0, server.capacity / Defaults.serverCapacity - 1);

        for (; i > -1; i -= 1) {
            Utilities.drawRect({
                x: server.x + 3 * i,
                y: server.y - 3 * i,
                width: size,
                height: size,
                color: options.color,
                borderColor: options.borderColor
            }, context);
        }

        //draw server's queue
        const speed = Defaults.serverSpeed,
            queueWidth = 5,
            queueHeight = size - 10,
            queueX = server.x + size / 2 - 7,
            queueY = server.y + 1,
            fillPercentage = (server.queue.length / server.capacity) * 100,
            gradientWidth = 5,
            gradientHeight = fillPercentage * queueHeight / 100,
            gradientX = queueX,
            gradientY = queueY + queueHeight / 2 - gradientHeight / 2;

        Utilities.drawRect({
            x: queueX,
            y: queueY,
            width: queueWidth + 2,
            height: queueHeight + 2,
            color: options.queueColor,
            borderColor: options.queueBorderColor
        }, context);

        const gradient = context.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, Defaults.successColor);
        gradient.addColorStop(1, Defaults.dangerColor);
        Utilities.drawRect({
            x: gradientX,
            y: gradientY,
            width: gradientWidth,
            height: gradientHeight,
            color: gradient
        }, context);

        //draw server's speed
        for (i = server.speed; i > 0; i -= speed) {
            const starX = server.x - size / 2 + 7,
                starY = server.y + size / 2 - 4 - 5 * (i / speed)
            Utilities.drawStar({
                x: starX,
                y: starY,
                outerRadius: 4,
                innerRadius: 2,
                color: options.speedColor,
                borderColor: options.speedBorderColor
            }, context);
        }
    }

    public static drawStar(star: Star, context: CanvasRenderingContext2D) {
        const centerX = star.x,
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
        Utilities.draw(star, context);
    }

    public static drawText(text: UIText, context: CanvasRenderingContext2D) {
        const fontFamily = text.fontFamily ?? 'monospace';

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

    public static drawTriangle(triangle: Triangle, context: CanvasRenderingContext2D) {
        const x = triangle.x,
            y = triangle.y,
            b = triangle.base,
            h = triangle.height;

        context.beginPath();
        context.moveTo(x, y - h / 2);
        context.lineTo(x + b / 2, y + h / 2);
        context.lineTo(x - b / 2, y + h / 2);
        Utilities.draw(triangle, context);
    }

    public static getDistance(x1: number, y1: number, x2: number, y2: number) {
        var xs = x2 - x1,
            ys = y2 - y1;

        return Math.sqrt(Math.pow(xs, 2) + Math.pow(ys, 2));
    }

    //must be string containing hex value ('#xxxxxx')
    public static invertColor(color: string) {
        color = color.substring(1);
        let colorNumber = parseInt(color, 16);
        colorNumber = 0xFFFFFF ^ colorNumber;
        color = colorNumber.toString(16);
        color = ('000000' + color).slice(-6);
        color = '#' + color;
        return color;
    }

    public static random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static draw(shape: Shape, context: CanvasRenderingContext2D) {
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