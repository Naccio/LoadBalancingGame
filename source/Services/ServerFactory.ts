/// <reference path='../Model/Server.ts' />
/// <reference path='GameTracker.ts' />

class ServerFactory {
    constructor(private game: GameTracker) { }

    create(x: number, y: number) {
        const server = new Server(x, y);

        this.game.servers.push(server);

        return server;
    }
}