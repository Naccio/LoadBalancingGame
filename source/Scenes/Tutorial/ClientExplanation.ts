/// <reference path='../../Defaults.ts' />
/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Services/ClientFactory.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class ClientExplanation extends TutorialStep {

    constructor(
        private canvas: Canvas,
        private clientFactory: ClientFactory
    ) {
        super([
            'This is a CLIENT.',
            'It wants to exchange data with your datacenter.',
            'Your job will be to connect the clients to a datacenter.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client = this.clientFactory.create({ x: w * 3 / 4, y: h / 2 }, 10000);

        client.life = -31;
    }

    draw() {
        const w = this.canvas.width,
            h = this.canvas.height,
            position = {
                x: w * 3 / 4,
                y: h / 2
            };

        Utilities.drawCircleHighlight(position, Defaults.clientSize + 9, this.canvas);
        this.canvas.drawCircle({
            position,
            radius: Defaults.clientSize / 2,
            color: 'gray'
        });
    }
}