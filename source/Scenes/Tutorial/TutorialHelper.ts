/// <reference path='../../Defaults.ts' />
/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Utilities.ts' />

class TutorialHelper {
    public static drawLegend(canvas: Canvas, includeNACK: boolean) {
        const w = canvas.width,
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

        canvas.drawCircle({
            ...circle,
            color: Defaults.messageReqColor,
            borderColor: Defaults.messageReqBorderColor
        });
        canvas.drawText({
            ...text,
            text: ': Request'
        });
        canvas.drawCircle({
            ...circle,
            y: y + lineSpacing,
            color: Defaults.messageAckColor,
            borderColor: Defaults.messageAckBorderColor
        });
        canvas.drawText({
            ...text,
            y: y + lineSpacing,
            text: ': Response (+1)'
        });
        if (includeNACK) {
            canvas.drawCircle({
                ...circle,
                y: y + lineSpacing * 2,
                color: Defaults.messageNackColor,
                borderColor: Defaults.messageNackBorderColor
            });
            canvas.drawText({
                ...text,
                y: y + lineSpacing * 2,
                text: ': Datacenter busy (-1)'
            });
        }
    }
}