/// <reference path='../../Defaults.ts' />
/// <reference path='../../Utilities.ts' />

class TutorialHelper {
    public static drawLegend(canvas: HTMLCanvasElement, includeNACK: boolean) {
        const context = canvas.getContext('2d')!,
            w = canvas.width,
            x = w - 120,
            y = 100,
            iconRadius = 3,
            textSpacing = 2,
            lineSpacing = iconRadius + 5,
            font = "10px sans-serif",
            circle = {
                x,
                y,
                radius: iconRadius,
                borderWidth: 1
            },
            text = {
                x: x + textSpacing + iconRadius,
                y,
                text: '',
                font
            };

        Utilities.drawCircle({
            ...circle,
            color: 'lightBlue',
            borderColor: 'skyBlue'
        }, context);
        Utilities.drawText({
            ...text,
            text: ': Request'
        }, context);
        Utilities.drawCircle({
            ...circle,
            y: y + lineSpacing,
            color: 'lime',
            borderColor: 'limeGreen'
        }, context);
        Utilities.drawText({
            ...text,
            y: y + lineSpacing,
            text: ': Response (+1)'
        }, context);
        if (includeNACK) {
            Utilities.drawCircle({
                ...circle,
                y: y + lineSpacing * 2,
                color: 'tomato',
                borderColor: 'indianRed'
            }, context);
            Utilities.drawText({
                ...text,
                y: y + lineSpacing * 2,
                text: ': Datacenter busy (-1)'
            }, context);
        }
    }
}