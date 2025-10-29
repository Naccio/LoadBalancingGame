/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep6 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) {
        super(5, [
            'Cool! Two new clients want to use your service!',
            'Connect them as well to start gaining some more popularity.',
            'Remember, if you wait too much, you will lose popularity!']);

        this.hasHome = true;
    }

    setup() {
        this.spawnClients();
    }

    run() {
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
        this.orchestrator.updateMessages();
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            align: CanvasTextAlign = 'start',
            baseline: CanvasTextBaseline = 'middle',
            color = 'black',
            messageSize = Defaults.messageSize;

        let font = '18px sans-serif';
        Utilities.drawText(10, h - 95, "Popularity: " + this.popularityTracker.popularity, font, align, baseline, color, context);

        font = "10px sans-serif";
        Utilities.drawText(w - 118 + messageSize / 2, 100, ': Request', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + messageSize + 5, ': Response (+1)', font, align, baseline, color, context);
        Utilities.drawCircle(w - 120, 100, messageSize / 2, 'lightBlue', 'skyBlue', 2, context);
        Utilities.drawCircle(w - 120, 100 + messageSize + 5, messageSize / 2, 'lime', 'limeGreen', 2, context);
    }

    private spawnClients() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client1 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 4, 10000),
            client2 = new Client(this.orchestrator, this.popularityTracker, w / 4, h * 3 / 4, 10000);

        client1.life = - 21;
        client2.life = - 21;

        this.game.clients.push(client1, client2);
    }
}