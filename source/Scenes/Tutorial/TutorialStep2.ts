/// <reference path='../../Defaults.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep2 extends TutorialStep {

    constructor(private canvas: HTMLCanvasElement) {
        super(1, [
            'This is a DATACENTER.',
            'Its role is to send data to your clients.',
            'Click "Next" to continue.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        Utilities.drawCircleHighlight(w / 2, h / 2, Defaults.serverSize + 9, context);
    }
}