/// <reference path='../Model/Point.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='GameTracker.ts' />

class ServerFactory {
    constructor(private game: GameTracker) { }

    create(position: Point) {
        const server = new Server(position);

        this.game.servers.push(server);

        return server;
    }
}