/// <reference path='Model/ServerOptions.ts' />
/// <reference path='Graphics/Canvas.ts' />

class Utilities {

    public static defaultButton(x: number, y: number, text: string, onClick: () => void) {
        return new SimpleButton(x, y, 120, 40, text, Defaults.primaryColor, onClick);
    }

    public static drawCircleHighlight(x: number, y: number, radius: number, canvas: Canvas) {
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
        canvas.drawCircle(innerCircle);
        canvas.drawCircle(outerCircle);
    }

    public static drawServer(server: Server, options: ServerOptions, canvas: Canvas) {
        options = {
            ...Defaults.serverDefaults,
            ...options
        };
        const size = options.size!;

        let i = Math.max(0, server.capacity / Defaults.serverCapacity - 1);

        for (; i > -1; i -= 1) {
            canvas.drawRect({
                x: server.x + 3 * i,
                y: server.y - 3 * i,
                width: size,
                height: size,
                color: options.color,
                borderColor: options.borderColor
            });
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

        canvas.drawRect({
            x: queueX,
            y: queueY,
            width: queueWidth + 2,
            height: queueHeight + 2,
            color: options.queueColor,
            borderColor: options.queueBorderColor
        });

        const gradient = canvas.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, Defaults.successColor);
        gradient.addColorStop(1, Defaults.dangerColor);
        canvas.drawRect({
            x: gradientX,
            y: gradientY,
            width: gradientWidth,
            height: gradientHeight,
            color: gradient
        });

        //draw server's speed
        for (i = server.speed; i > 0; i -= speed) {
            const starX = server.x - size / 2 + 7,
                starY = server.y + size / 2 - 4 - 5 * (i / speed)
            canvas.drawStar({
                x: starX,
                y: starY,
                outerRadius: 4,
                innerRadius: 2,
                color: options.speedColor,
                borderColor: options.speedBorderColor
            });
        }
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
}