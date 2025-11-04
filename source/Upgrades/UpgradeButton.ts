/// <reference path='../UI/SpecialButton.ts' />
/// <reference path='../Utilities.ts' />

class UpgradeButton extends SpecialButton {

    constructor(x: number, y: number, text: string, onClick: () => void, draw: (c: CanvasRenderingContext2D) => void) {
        const width = 100,
            height = 100;

        super(x, y, width, height, onClick, (hovered, context) => {
            Utilities.drawRect({
                x,
                y,
                width,
                height,
                color: '#333333',
                borderColor: hovered ? 'white' : undefined,
                borderWidth: 2
            }, context);

            draw(context);

            if (hovered) {
                Utilities.drawText({
                    x: context.canvas.width / 2,
                    y: context.canvas.height - 50,
                    text,
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        })
    }

}