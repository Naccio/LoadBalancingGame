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
            circle = {
                x,
                y,
                radius: iconRadius
            },
            text = {
                x: x + textSpacing + iconRadius,
                y,
                fontSize: 10,
                fontFamily: 'sans-serif'
            };

        Utilities.drawCircle({
            ...circle,
            color: Defaults.messageReqColor,
            borderColor: Defaults.messageReqBorderColor
        }, context);
        Utilities.drawText({
            ...text,
            text: ': Request'
        }, context);
        Utilities.drawCircle({
            ...circle,
            y: y + lineSpacing,
            color: Defaults.messageAckColor,
            borderColor: Defaults.messageAckBorderColor
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
                color: Defaults.messageNackColor,
                borderColor: Defaults.messageNackBorderColor
            }, context);
            Utilities.drawText({
                ...text,
                y: y + lineSpacing * 2,
                text: ': Datacenter busy (-1)'
            }, context);
        }
    }
}