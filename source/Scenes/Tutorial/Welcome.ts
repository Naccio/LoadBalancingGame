/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Services/ServerFactory.ts' />
/// <reference path='TutorialStep.ts' />

class Welcome extends TutorialStep {

    constructor(
        private canvas: Canvas,
        private serverFactory: ServerFactory
    ) {
        super([
            'Welcome to Load Balancing: The Game!',
            'Here you will take the role of -you guessed it- a LOAD BALANCER.',
            'Click "Next" to start the tutorial.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height,
            server = this.serverFactory.create(w / 2, h / 2);

        server.capacity = 20;
    }
}