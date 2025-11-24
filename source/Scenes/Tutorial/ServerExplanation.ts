/// <reference path='../../Defaults.ts' />
/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class ServerExplanation extends TutorialStep {

    constructor(private canvas: Canvas) {
        super([
            'This is a DATACENTER.',
            'Its role is to send data to your clients.',
            'Click "Next" to continue.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    draw() {
        Utilities.drawCircleHighlight(this.canvas.center, Defaults.serverSize + 9, this.canvas);
    }
}