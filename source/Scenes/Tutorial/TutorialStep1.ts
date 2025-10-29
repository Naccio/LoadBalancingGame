/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep1 extends TutorialStep {

    constructor(private canvas: HTMLCanvasElement, private game: GameTracker) {
        super(0, [
            'Welcome to Load Balancing: The Game!',
            'Here you will take the role of -you guessed it- a LOAD BALANCER.',
            'Click "Next" to start the tutorial.']);

        this.hasNext = true;
        this.hasHome = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height;

        this.game.servers.push(new Server(w / 2, h / 2));
        this.game.servers[0].capacity = 20;
    }
}