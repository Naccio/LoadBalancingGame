/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class ConnectToNewServer extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private popularityTracker: PopularityTracker,
        private clientFactory: ClientFactory
    ) {
        super([
            'Perfect! Now you have a new datacenter at your disposal.',
            'This is when a good load balancing strategy will start to matter.',
            'Indeed you would be wiser to connect the clients to the new datacenter.']);

        this.hasHome = true;
    }

    setup() {
        this.game.clients[0].life = - 21;
        this.game.clients[1].life = - 21;
    }

    update() {
        if (this.game.clients.length === 0) {
            const w = this.canvas.width,
                h = this.canvas.height,
                client0 = this.clientFactory.create(w / 4, h / 3, 10000),
                client1 = this.clientFactory.create(w * 3 / 4, h / 3, 10000);

            client0.life = - 21;
            client1.life = - 21;
        }
        if (this.game.clients[0].connectedTo !== undefined && this.game.clients[1].connectedTo !== undefined) {
            this.advance = true;
        }
        this.game.update();
    }

    draw() {
        const h = this.canvas.height;

        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}