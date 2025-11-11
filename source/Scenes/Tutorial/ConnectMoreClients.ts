/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Graphics/Canvas.ts' />
/// <reference path='../../Services/ClientFactory.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class ConnectMoreClients extends TutorialStep {

    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private popularityTracker: PopularityTracker,
        private clientFactory: ClientFactory
    ) {
        super([
            'Cool! Two new clients want to use your service!',
            'Connect them as well to start gaining some more popularity.',
            'Remember, if you wait too much, you will lose popularity!']);

        this.hasHome = true;
    }

    setup() {
        this.spawnClients();
    }

    update() {
        const server = this.game.servers[0];

        if (server.queue.length > server.capacity / 2) {
            this.advance = true;
        }
        if (this.game.clients.length === 1) {
            this.texts = [
                'Oh snap! You let too much time pass!',
                'As you can see you lost 10 popularity each.',
                'Connect the two clients to continue.'];
            this.spawnClients();
        }
        this.game.update();
    }

    draw() {
        const h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);
    }

    private spawnClients() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client1 = this.clientFactory.create(w / 4, h / 4, 10000),
            client2 = this.clientFactory.create(w / 4, h * 3 / 4, 10000);

        client1.life = - 21;
        client2.life = - 21;
    }
}