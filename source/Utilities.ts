/// <reference path='Model/Point.ts' />
/// <reference path='Model/ServerOptions.ts' />
/// <reference path='Graphics/Canvas.ts' />

class Utilities {

    public static defaultButton(position: Point, text: string, onClick: () => void) {
        return new SimpleButton(position, 120, 40, text, Defaults.primaryColor, onClick);
    }

    public static drawCircleHighlight(position: Point, radius: number, canvas: Canvas) {
        const
            innerCircle = {
                position,
                radius,
                borderColor: 'fireBrick',
                borderWidth: 2
            },
            outerCircle = {
                ...innerCircle,
                radius: radius + 1,
                borderColor: 'red'
            };
        canvas.drawCircle(innerCircle);
        canvas.drawCircle(outerCircle);
    }

    public static drawServer(server: Server, options: ServerOptions, canvas: Canvas) {
        options = {
            ...Defaults.serverDefaults,
            ...options
        };
        const size = options.size!,
            p = server.position;

        let i = Math.max(0, server.capacity / Defaults.serverCapacity - 1);

        for (; i > -1; i -= 1) {
            canvas.drawRect({
                position: {
                    x: p.x + 3 * i,
                    y: p.y - 3 * i
                },
                width: size,
                height: size,
                color: options.color,
                borderColor: options.borderColor
            });
        }

        //draw server's queue
        const speed = Defaults.serverSpeed,
            queueWidth = 6,
            queueHeight = size - 10,
            queueX = p.x + size / 2 - 7,
            queueY = p.y,
            fullness = server.queue.length / server.capacity,
            gradientWidth = queueWidth,
            gradientHeight = MathHelper.roundToEven(fullness * queueHeight),
            gradientX = queueX,
            gradientY = queueY + queueHeight / 2 - gradientHeight / 2;

        canvas.drawRect({
            position: {
                x: queueX,
                y: queueY
            },
            width: queueWidth,
            height: queueHeight,
            color: options.queueColor
        });

        const gradient = canvas.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, Defaults.successColor);
        gradient.addColorStop(1, Defaults.dangerColor);
        canvas.drawRect({
            position: {
                x: gradientX,
                y: gradientY
            },
            width: gradientWidth,
            height: gradientHeight,
            color: gradient
        });

        canvas.drawRect({
            position: {
                x: queueX,
                y: queueY
            },
            width: queueWidth,
            height: queueHeight,
            borderColor: options.queueBorderColor
        });

        //draw server's speed
        for (i = server.speed; i > 0; i -= speed) {
            const starX = p.x - size / 2 + 7,
                starY = p.y + size / 2 - 4 - 5 * (i / speed);

            canvas.drawStar({
                position: {
                    x: starX,
                    y: starY
                },
                outerRadius: 4,
                innerRadius: 2,
                color: options.speedColor,
                borderColor: options.speedBorderColor
            });
        }
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
}