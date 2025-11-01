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
            textX = x + textSpacing + iconRadius,
            align: CanvasTextAlign = 'start',
            baseline: CanvasTextBaseline = 'middle',
            color = 'black',
            font = "10px sans-serif",
            circle = {
                x,
                y,
                radius: iconRadius,
                borderWidth: 1
            };

        Utilities.drawCircle({
            ...circle,
            color: 'lightBlue',
            borderColor: 'skyBlue'
        }, context);
        Utilities.drawText(textX, y, ': Request', font, align, baseline, color, context);
        Utilities.drawCircle({
            ...circle,
            y: y + lineSpacing,
            color: 'lime',
            borderColor: 'limeGreen'
        }, context);
        Utilities.drawText(textX, y + lineSpacing, ': Response (+1)', font, align, baseline, color, context);
        if (includeNACK) {
            Utilities.drawCircle({
                ...circle,
                y: y + lineSpacing * 2,
                color: 'tomato',
                borderColor: 'indianRed'
            }, context);
            Utilities.drawText(textX, y + lineSpacing * 2, ': Datacenter busy (-1)', font, align, baseline, color, context);
        }
    }
}