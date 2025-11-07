/// <reference path='../Defaults.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='MessageOrchestrator.ts' />
/// <reference path='PopularityTracker.ts' />

class ClientFactory {
    constructor(
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker,
        private fader: TextFader
    ) { }

    create(x: number, y: number, messages: number) {
        const clientSize = Defaults.clientSize,
            client = new Client(this.orchestrator, this.popularityTracker, x, y, messages);

        this.game.clients.push(client);
        this.fader.createQueue(x.toString() + y.toString(), x, y - 8 - clientSize / 2);

        return client;
    }
}