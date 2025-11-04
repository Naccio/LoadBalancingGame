/// <reference path='../UI/SpecialButton.ts' />
/// <reference path='../Utilities.ts' />

class UpgradeButton extends SpecialButton {

    constructor(x: number, y: number, text: string, onClick: () => void, draw: (c: CanvasRenderingContext2D) => void) {
        super(x, y, 100, 100, '#333333', 'white', 2, onClick, (hovered, context) => {
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