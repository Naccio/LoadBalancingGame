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
        const server = this.serverFactory.create(this.canvas.center);

        server.capacity = 20;
    }
}