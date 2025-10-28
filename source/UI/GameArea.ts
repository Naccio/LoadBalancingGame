/// <reference path='../Defaults.ts' />
/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Client.ts' />
/// <reference path='../Model/Message.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../Services/UpgradesTracker.ts' />
/// <reference path='../UI/CursorTracker.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='../Utilities.ts' />

class GameArea {
    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker,
        private upgradesTracker: UpgradesTracker,
        private cursor: CursorTracker,
        private fader: TextFader
    ) { }

    draw() {
        const context = this.canvas.getContext('2d')!,
            sc = this.game.selectedClient;

        //draw a line connecting the selected client to the mouse pointer
        if (sc !== undefined) {
            Utilities.drawLine(sc.x, sc.y, this.cursor.mouseX, this.cursor.mouseY, 'lightBlue', 3, context);
            Utilities.drawCircle(sc.x, sc.y, Defaults.clientSize / 2 + 3, 'lightBlue', '', 0, context);
        }

        this.drawConnections();
        this.drawMessages();
        this.drawClients();
        this.drawAttackers();
        this.drawServers();
        this.drawUI();
    }

    drawAttackers() {
        this.game.attackers.forEach(a => this.drawAttacker(a));
    }

    drawClients() {
        this.game.clients.forEach(c => this.drawClient(c));
    }

    drawConnections() {
        this.game.clients.forEach(c => this.drawConnection(c, 'darkGray'));
        this.game.attackers.forEach(a => this.drawConnection(a, 'dimGray'));
    }

    drawMessages() {
        this.orchestrator.messages.forEach(m => this.drawMessage(m));
    }

    drawServers() {
        this.game.servers.forEach(s => this.drawServer(s));
    }

    drawUI() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        let font = "18px sans-serif",
            color = "black";

        this.fader.draw();

        //bottom left
        Utilities.drawText(10, h - 14, "Popularity: " + this.popularityTracker.popularity, font, 'start', 'alphabetic', color, context);

        //bottom center
        color = "darkGray";
        Utilities.drawText(w / 2, h - 14, "Press space to pause", font, 'center', 'alphabetic', color, context);

        if (this.upgradesTracker.upgradesAvailable > 0) {
            const text = {
                x: w / 2,
                y: h - 35,
                fontSize: 20,
                fontWeight: '',
                font: "20px sans-serif",
                color: { r: 255, g: 0, b: 0 },
                id: "upgrade",
                text: "- Upgrade available! -",
                life: 400,
                alpha: 0,
                delta: 0
            }

            this.fader.addPermanentText(text);
        }

        //bottom right
        const remaining = Math.max(0, Defaults.gameLength * 60 - this.game.elapsedTime),
            m = Math.floor(remaining / 60),
            s = Math.floor(remaining - m * 60);
        let text = '';
        if (m < 10) {
            text += '0';
        }
        text += m + ':';
        if (s < 10) {
            text += '0';
        }
        text += s;

        if (remaining <= 30) {
            color = "tomato";
        }
        if (remaining <= 10) {
            color = "red";
        }
        Utilities.drawText(w - 10, h - 14, text, font, 'end', 'alphabetic', color, context);
    }

    private drawAttacker(attacker: Attacker) {
        const context = this.canvas.getContext('2d')!,
            size = Defaults.clientSize,
            x = attacker.x,
            y = attacker.y;

        Utilities.drawTriangle(x, y, size * 2 / Math.sqrt(3), size, '#333333', 'black', 2, context);

        Utilities.drawText(x, y + 5, 'DoS', 'bold 10px Arial', 'center', 'middle', 'white', context);
    }

    private drawClient(client: Client) {
        const context = this.canvas.getContext('2d')!,
            clientSize = Defaults.clientSize,
            maxClientWaitTime = Defaults.maxClientWaitTime,
            x = client.x,
            y = client.y;

        if (client.connectedTo === undefined) {
            if (client.connectedTo === undefined && client.life > maxClientWaitTime - 2) {
                Utilities.drawCircle(x, y, clientSize / 2, 'red', 'fireBrick', 2, context);
            } else if (client.connectedTo === undefined && client.life > maxClientWaitTime - 3.5) {
                Utilities.drawCircle(x, y, clientSize / 2, 'tomato', 'indianRed', 2, context);
            } else {
                Utilities.drawCircle(x, y, clientSize / 2, 'gray', 'dimGray', 2, context);
            }

            Utilities.drawText(x, y, Math.round(maxClientWaitTime - client.life).toString(), 'bold 15px Arial', 'center', 'middle', 'white', context);
        }
        else {
            Utilities.drawCircle(x, y, clientSize / 2, 'gray', 'dimGray', 2, context);
        }
    }

    private drawConnection(t: MessageTransmitter, color: string) {
        if (t.connectedTo) {
            const context = this.canvas.getContext('2d')!;
            Utilities.drawLine(t.x, t.y, t.connectedTo.x, t.connectedTo.y, color, 1, context);
        }
    }

    private drawMessage(message: Message) {
        const context = this.canvas.getContext('2d')!;
        let fill, border;

        switch (message.status) {
            case 'queued':
            case 'done':
                return;
            case 'req':
                fill = "lightBlue";
                border = "steelBlue";
                break;
            case 'ack':
                fill = "lime";
                border = "limeGreen";
                break;
            case 'nack':
                fill = "tomato";
                border = "indianRed";
                break;
            default:
                throw 'Invalid message status: ' + message.status;
        }

        Utilities.drawCircle(message.x, message.y, Defaults.messageSize / 2, fill, border, 1, context);
    }

    private drawServer(server: Server) {
        const context = this.canvas.getContext('2d')!,
            serverSize = Defaults.serverSize;
        let i = Math.max(0, server.capacity / Defaults.serversCapacity - 1);

        for (; i > -1; i -= 1) {
            const fill = `rgb(0,${128 - 15 * i},0)`,
                border = `rgb(0,${100 - 15 * i},0)`;
            Utilities.drawRect(server.x + 3 * i, server.y - 3 * i, serverSize, serverSize, fill, border, 1, context);
        }

        //draw server's queue
        const serversSpeed = Defaults.serversSpeed,
            queueWidth = 5,
            queueHeight = serverSize - 10,
            queueX = server.x + serverSize / 2 - 7,
            queueY = server.y + 1,
            fillPercentage = (server.queue.length / server.capacity) * 100,
            gradientWidth = 5,
            gradientHeight = fillPercentage * queueHeight / 100,
            gradientX = queueX,
            gradientY = queueY + queueHeight / 2 - gradientHeight / 2;

        Utilities.drawRectBorder(queueX, queueY, queueWidth, queueHeight, '#004500', 1, context);
        const gradient = context.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, 'limeGreen');
        gradient.addColorStop(1, 'red');
        Utilities.drawRect(gradientX, gradientY, gradientWidth, gradientHeight, gradient, '', 0, context);

        //draw server's speed
        for (i = server.speed; i > 0; i -= serversSpeed) {
            const starX = server.x - serverSize / 2 + 7,
                starY = server.y + serverSize / 2 - 4 - 5 * (i / serversSpeed)
            Utilities.drawStar(starX, starY, 5, 4, 2, 'limeGreen', '#004500', 2, context);
        }
    }
}