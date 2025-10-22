/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Client.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='PopularityTracker.ts' />

class GameTracker {
    public selectedClient?: Client;
    public currentGameMode = 0;
    public clientsServed = 0;
    public droppedConnections = 0;
    public failedConnections = 0;
    public elapsedTime = 0;
    public servers: Server[] = [];
    public clients: Client[] = [];
    public attackers: Attacker[] = [];

    constructor(private popularityTracker: PopularityTracker) { }

    update() {
        this.elapsedTime += 1 / Defaults.frameRate;
        this.updateClients();
        this.updateServers();
        this.updateAttackers();
    }

    private updateServers() {
        const elapsedTime = this.elapsedTime;

        this.servers.forEach(function (s) {
            if ((elapsedTime - s.lastMessageTime) > 1 / s.speed) {
                s.sendMessage(elapsedTime);
            }
        });
    }

    private updateClients() {
        const elapsedTime = this.elapsedTime,
            remaining = Defaults.gameLength * 60 - elapsedTime;

        for (let i = 0; i < this.clients.length; i++) {
            var c = this.clients[i];

            if (remaining <= 0 && c.messagesToSend > 0) {
                c.acksToReceive -= c.messagesToSend;
                c.messagesToSend = 0;
            }

            //Check if client is done sending messages
            if (c.messagesToSend === 0 && c.acksToReceive === 0) {
                this.clients.splice(i--, 1);
                this.clientsServed += 1;
                continue;
            }

            //Check if client received too many nacks
            if (c.nacksToDie === 0) {
                c.connectedTo = undefined;
                this.clients.splice(i--, 1);
                this.droppedConnections += 1;
                continue;
            }

            if (c.connectedTo === undefined) {
                c.life += 1 / Defaults.frameRate;

                //Check if client waited too much
                if (remaining <= 0 || c.life > Defaults.maxClientWaitTime) {
                    this.clients.splice(i--, 1);
                    if (c === this.selectedClient) {
                        this.selectedClient = undefined;
                    }
                    this.failedConnections += 1;
                    this.popularityTracker.updatePopularity(-10, c.x, c.y);
                }
            } else {
                if (c.messagesToSend > 0 && (elapsedTime - c.lastMessageTime) > 1 / Defaults.clientsSpeed) {
                    c.sendMessage(elapsedTime);
                }
            }
        }
    }

    private updateAttackers() {
        const elapsedTime = this.elapsedTime;

        for (let i = 0; i < this.attackers.length; i += 1) {
            var a = this.attackers[i];

            //check if all attacker messages have reached the server
            if (a.messagesToReceive === 0) {
                this.attackers.splice(i--, 1);
                continue;
            }

            if (a.messagesToSend != 0 && elapsedTime - a.lastMessageTime > 0.5 / Defaults.clientsSpeed) {
                a.sendMessage(elapsedTime);
            }
        }
    }
}