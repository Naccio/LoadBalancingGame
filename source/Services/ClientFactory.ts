/// <reference path='../Model/Client.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='MessageOrchestrator.ts' />
/// <reference path='PopularityTracker.ts' />

class ClientFactory {
    constructor(
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker
    ) { }

    create(position: Point, messages: number) {
        const client = new Client(this.orchestrator, this.popularityTracker, position, messages);

        this.game.clients.push(client);

        return client;
    }
}