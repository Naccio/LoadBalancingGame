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
            lineSpacing = iconRadius + 5;

        canvas.drawCircle({
            position: { x, y },
            radius: iconRadius,
            color: Defaults.messageReqColor,
            borderColor: Defaults.messageReqBorderColor
        });
        canvas.drawText({
            position: {
                x: x + textSpacing + iconRadius,
                y
            },
            fontSize: 10,
            fontFamily: 'sans-serif',
            text: ': Request'
        });
        canvas.drawCircle({
            position: { x, y: y + lineSpacing },
            radius: iconRadius,
            color: Defaults.messageAckColor,
            borderColor: Defaults.messageAckBorderColor
        });
        canvas.drawText({
            position: {
                x: x + textSpacing + iconRadius,
                y: y + lineSpacing
            },
            fontSize: 10,
            fontFamily: 'sans-serif',
            text: ': Response (+1)'
        });
        if (includeNACK) {
            canvas.drawCircle({
                position: { x, y: y + lineSpacing * 2 },
                radius: iconRadius,
                color: Defaults.messageNackColor,
                borderColor: Defaults.messageNackBorderColor
            });
            canvas.drawText({
                position: {
                    x: x + textSpacing + iconRadius,
                    y: y + lineSpacing * 2
                },
                fontSize: 10,
                fontFamily: 'sans-serif',
                text: ': Datacenter busy (-1)'
            });
        }
    }
}