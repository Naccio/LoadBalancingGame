/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../MathHelper.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='../VectorMath.ts' />
/// <reference path='AttackerFactory.ts' />
/// <reference path='ClientFactory.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='PopularityTracker.ts' />
/// <reference path='ServerFactory.ts' />

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
        private canvas: Canvas,
        private game: GameTracker,
        private clientFactory: ClientFactory,
        private attackerFactory: AttackerFactory,
        private serverFactory: ServerFactory
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
            serverSize = Defaults.serverSize,
            padding = { x: serverSize, y: serverSize },
            zoneSize = { x: width / 3, y: height / 3 };
        
        let scale;

        switch (zone) {
            case 'nw':
                scale = { x: 0, y: 0 };
                break;
            case 'n':
                scale = { x: 1, y: 0 };
                break;
            case 'ne':
                scale = { x: 2, y: 0 };
                break;
            case 'w':
                scale = { x: 0, y: 1 };
                break;
            case 'c':
                scale = { x: 1, y: 1 };
                break;
            case 'e':
                scale = { x: 2, y: 1 };
                break;
            case 'sw':
                scale = { x: 0, y: 2 };
                break;
            case 's':
                scale = { x: 1, y: 2 };
                break;
            case 'se':
                scale = { x: 2, y: 2 };
                break;
            default:
                throw `Invalid zone: ${zone}.`;
        }

        const shift = VectorMath.hadamardProduct(zoneSize, scale),
            min = VectorMath.add(VectorMath.zero, shift).add(padding),
            max = VectorMath.add(zoneSize, shift).subtract(padding),
            position = this.getRandomPositionBounded(min, max);

        this.serverFactory.create(position);
    };

    createClient() {
        const elapsedTime = this.game.elapsedTime,
            messages = MathHelper.randomInt(this.minClientMessages, this.maxClientMessages) + Math.floor(this.popularityTracker.popularity / 100),
            position = this.getRandomPosition(Defaults.clientSize);

        this.clientFactory.create(position, messages);
        this.timeLastClient = elapsedTime;
    };

    initiateDDoS() {
        const elapsedTime = this.game.elapsedTime,
            modifier = Math.floor(this.popularityTracker.popularity / 400),
            messages = this.attackersMessages + modifier,
            number = this.attackersNumber + modifier;

        for (let i = 0; i < number; i += 1) {
            const position = this.getRandomPosition(Defaults.clientSize),
                server = this.findClosestServer(position);

            if (server) {
                this.attackerFactory.create(position, messages, server);
            }
        }

        this.timeLastDDoS = elapsedTime;
    };

    private checkCollisions(position: Point) {
        const serverSize = Defaults.serverSize,
            clientSize = Defaults.clientSize,
            servers = this.game.servers,
            clients = this.game.clients,
            attackers = this.game.attackers,
            { x, y } = position;

        for (let i = 0; i < servers.length; i += 1) {
            const p = servers[i].position;
            if (Math.abs(x - p.x) < serverSize && Math.abs(y - p.y) < 2 * serverSize) {
                return true;
            }
        }
        for (let i = 0; i < clients.length; i += 1) {
            const p = clients[i].position;
            if (Math.abs(x - p.x) < clientSize && Math.abs(y - p.y) < clientSize) {
                return true;
            }
        }
        for (let i = 0; i < attackers.length; i += 1) {
            const p = attackers[i].position;
            if (Math.abs(x - p.x) < clientSize && Math.abs(y - p.y) < clientSize) {
                return true;
            }
        }
    }

    private findClosestServer(position: Point) {
        let closest,
            currentDistance = this.canvas.width;

        this.game.servers.forEach((server) => {
            const newDistance = VectorMath.distance(position, server.position);
            if (newDistance < currentDistance) {
                currentDistance = newDistance;
                closest = server;
            }
        });

        return closest;
    }

    private getRandomPosition(size: number) {
        const width = this.canvas.width,
            height = this.canvas.height,
            min = {
                x: size,
                y: size,
            },
            max = {
                x: width - size,
                y: height - size
            };

        return this.getRandomPositionBounded(min, max);
    }

    private getRandomPositionBounded(min: Point, max: Point) {
        let x, y;

        do {
            x = MathHelper.randomInt(min.x, max.x);
            y = MathHelper.randomInt(min.y, max.y);
        } while (this.checkCollisions({ x, y }))

        return { x, y };
    }
}