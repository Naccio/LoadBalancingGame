/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Client.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='ClientFactory.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='MessageOrchestrator.ts' />
/// <reference path='PopularityTracker.ts' />

class Scheduler {
    public timeLastDDoS = 0;
    public minClientMessages = 25;
    public maxClientMessages = 35;
    public attackersMessages = 30;
    public attackersNumber = 1;
    public spawnRate = 6;
    public attackRate = 80;
    public timeLastClient = 1 - this.spawnRate;

    constructor(
        private popularityTracker: PopularityTracker,
        private orchestrator: MessageOrchestrator,
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private clientFactory: ClientFactory
    ) { }

    schedule() {
        const popularity = this.popularityTracker.popularity,
            elapsedTime = this.game.elapsedTime,
            remaining = Defaults.gameLength * 60 - elapsedTime;

        if (remaining > Defaults.maxClientWaitTime) {
            if (elapsedTime - this.timeLastClient > Math.max(this.spawnRate - Math.cbrt(popularity / 40), 1.6) && Math.random() > 0.3) {
                this.createClient();
            }
        }

        if (remaining > 30) {
            if (elapsedTime - this.timeLastDDoS > Math.max(this.attackRate - popularity / 100, 60) && Math.random() > 0.3) {
                this.initiateDDoS();
            }
        }
    }

    reset() {
        this.timeLastDDoS = 0;
        this.timeLastClient = 1 - this.spawnRate;
    }

    createServer(zone: string) {
        const width = this.canvas.width,
            height = this.canvas.height,
            serverSize = Defaults.serverSize;
        let x, y, minX, minY, maxX, maxY;

        switch (zone) {
            case 'nw':
                minX = serverSize;
                minY = serverSize;
                maxX = width / 3;
                maxY = height / 3;
                break;
            case 'n':
                minX = width / 3;
                minY = serverSize;
                maxX = width * 2 / 3;
                maxY = height / 3;
                break;
            case 'ne':
                minX = width * 2 / 3;
                minY = serverSize;
                maxX = width - serverSize;
                maxY = height / 3;
                break;
            case 'w':
                minX = serverSize;
                minY = height / 3;
                maxX = width / 3;
                maxY = height * 2 / 3;
                break;
            case 'c':
                minX = width / 3;
                minY = height / 3;
                maxX = width * 2 / 3;
                maxY = height * 2 / 3;
                break;
            case 'e':
                minX = width * 2 / 3;
                minY = height / 3;
                maxX = width - serverSize;
                maxY = height * 2 / 3;
                break;
            case 'sw':
                minX = serverSize;
                minY = height * 2 / 3;
                maxX = width / 3;
                maxY = height - serverSize;
                break;
            case 's':
                minX = width / 3;
                minY = height * 2 / 3;
                maxX = width * 2 / 3;
                maxY = height - serverSize;
                break;
            case 'se':
                minX = width * 2 / 3;
                minY = height * 2 / 3;
                maxX = width - serverSize;
                maxY = height - serverSize;
                break;
            default:
                throw `Invalid zone: ${zone}.`;
        }

        x = Utilities.random(minX, maxX);
        y = Utilities.random(minY, maxY);
        while (this.checkCollisions(x, y)) {
            x = Utilities.random(minX, maxX);
            y = Utilities.random(minY, maxY);
        }

        this.game.servers.push(new Server(x, y));
    };

    createClient() {
        const width = this.canvas.width,
            height = this.canvas.height,
            elapsedTime = this.game.elapsedTime,
            clientSize = Defaults.clientSize,
            minX = clientSize,
            maxX = width - clientSize,
            minY = clientSize,
            maxY = height - clientSize,
            messages = Utilities.random(this.minClientMessages, this.maxClientMessages) + Math.floor(this.popularityTracker.popularity / 100);

        let x = Utilities.random(minX, maxX),
            y = Utilities.random(minY, maxY);
        while (this.checkCollisions(x, y)) {
            x = Utilities.random(minX, maxX);
            y = Utilities.random(minY, maxY);
        }

        this.clientFactory.create(x, y, messages);
        this.timeLastClient = elapsedTime;
    };

    initiateDDoS() {
        const width = this.canvas.width,
            height = this.canvas.height,
            elapsedTime = this.game.elapsedTime,
            clientSize = Defaults.clientSize,
            minX = clientSize,
            maxX = width - clientSize,
            minY = clientSize,
            maxY = height - clientSize,
            modifier = Math.floor(this.popularityTracker.popularity / 400),
            messages = this.attackersMessages + modifier,
            number = this.attackersNumber + modifier;

        for (let i = 0; i < number; i += 1) {
            let x = Utilities.random(minX, maxX),
                y = Utilities.random(minY, maxY);
            while (this.checkCollisions(x, y)) {
                x = Utilities.random(minX, maxX);
                y = Utilities.random(minY, maxY);
            }

            const server = this.findClosestServer(x, y);

            if (server) {
                const attacker = new Attacker(this.orchestrator, x, y, messages, server);
                this.game.attackers.push(attacker);
            }
        }

        this.timeLastDDoS = elapsedTime;
    };

    private checkCollisions(x: number, y: number) {
        const serverSize = Defaults.serverSize,
            clientSize = Defaults.clientSize,
            servers = this.game.servers,
            clients = this.game.clients,
            attackers = this.game.attackers;

        for (let i = 0; i < servers.length; i += 1) {
            const s = servers[i];
            if (Math.abs(x - s.x) < serverSize && Math.abs(y - s.y) < 2 * serverSize) {
                return true;
            }
        }
        for (let i = 0; i < clients.length; i += 1) {
            const c = clients[i];
            if (Math.abs(x - c.x) < clientSize && Math.abs(y - c.y) < clientSize) {
                return true;
            }
        }
        for (let i = 0; i < attackers.length; i += 1) {
            const a = attackers[i];
            if (Math.abs(x - a.x) < clientSize && Math.abs(y - a.y) < clientSize) {
                return true;
            }
        }
    }

    private findClosestServer(x: number, y: number) {
        let closest,
            currentDistance = this.canvas.width;

        this.game.servers.forEach((server) => {
            const newDistance = Utilities.getDistance(x, y, server.x, server.y);
            if (newDistance < currentDistance) {
                currentDistance = newDistance;
                closest = server;
            }
        });

        return closest;
    }
}