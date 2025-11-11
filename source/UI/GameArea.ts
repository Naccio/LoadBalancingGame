/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Client.ts' />
/// <reference path='../Model/Message.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../Upgrades/UpgradesTracker.ts' />
/// <reference path='../UI/CursorTracker.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='../Utilities.ts' />

class GameArea {
    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker,
        private upgradesTracker: UpgradesTracker,
        private cursor: CursorTracker,
        private fader: TextFader
    ) { }

    draw() {
        const sc = this.game.selectedClient;

        //draw a line connecting the selected client to the mouse pointer
        if (sc !== undefined) {
            this.canvas.drawLine({
                x1: sc.x,
                y1: sc.y,
                x2: this.cursor.mouseX,
                y2: this.cursor.mouseY,
                color: Defaults.highlightColor,
                width: Defaults.highlightWidth
            });
            this.canvas.drawCircle({
                x: sc.x,
                y: sc.y,
                radius: Defaults.clientSize / 2 + Defaults.highlightWidth,
                color: Defaults.highlightColor
            });
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
        this.game.clients.forEach(c => this.drawConnection(c, Defaults.clientConnectionColor));
        this.game.attackers.forEach(a => this.drawConnection(a, Defaults.attackerConnectionColor));
    }

    drawMessages() {
        this.orchestrator.messages.forEach(m => this.drawMessage(m));
    }

    drawServers() {
        this.game.servers.forEach(s => this.drawServer(s));
    }

    drawUI() {
        const w = this.canvas.width,
            h = this.canvas.height;
        this.fader.draw();

        //bottom left
        this.popularityTracker.draw(h - 14);

        //bottom center
        this.canvas.drawText({
            x: w / 2,
            y: h - 14,
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            baseline: 'alphabetic',
            color: Defaults.secondaryColorMuted
        });

        if (this.upgradesTracker.upgradesAvailable > 0) {
            const text = {
                x: w / 2,
                y: h - 35,
                fontSize: 20,
                rgbColor: { r: 255, g: 0, b: 0 },
                id: 'upgrade',
                text: '- Upgrade available! -',
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

        let color = Defaults.secondaryColor
        if (remaining <= 30) {
            color = Defaults.dangerColorMuted;
        }
        if (remaining <= 10) {
            color = Defaults.dangerColor;
        }
        this.canvas.drawText({
            x: w - 10,
            y: h - 14,
            text,
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'end',
            baseline: 'alphabetic',
            color
        });
    }

    private drawAttacker(attacker: Attacker) {
        const size = Defaults.clientSize,
            x = attacker.x,
            y = attacker.y;

        this.canvas.drawTriangle({
            x,
            y,
            base: size * 2 / Math.sqrt(3),
            height: size,
            color: Defaults.attackerColor,
            borderColor: Defaults.attackerBorderColor,
            borderWidth: 2
        });
        this.canvas.drawText({
            x,
            y: y + 8,
            text: 'DoS',
            fontWeight: 'bold',
            fontSize: 9,
            fontFamily: 'Arial',
            align: 'center',
            color: Defaults.attackerTextColor
        });
    }

    private drawClient(client: Client) {
        const clientSize = Defaults.clientSize,
            maxClientWaitTime = Defaults.maxClientWaitTime,
            x = client.x,
            y = client.y,
            circle = {
                x,
                y,
                radius: clientSize / 2,
                color: Defaults.clientColor,
                borderColor: Defaults.clientBorderColor
            };

        if (client.connectedTo === undefined) {
            if (client.connectedTo === undefined && client.life > maxClientWaitTime - 2) {
                this.canvas.drawCircle({
                    ...circle,
                    color: Defaults.dangerColor,
                    borderColor: Defaults.dangerColorDark
                });
            } else if (client.connectedTo === undefined && client.life > maxClientWaitTime - 3.5) {
                this.canvas.drawCircle({
                    ...circle,
                    color: Defaults.dangerColorMuted,
                    borderColor: Defaults.dangerColorMutedDark
                });
            } else {
                this.canvas.drawCircle(circle);
            }

            this.canvas.drawText({
                x,
                y,
                text: Math.round(maxClientWaitTime - client.life).toString(),
                fontWeight: 'bold',
                fontSize: 15,
                fontFamily: 'Arial',
                align: 'center',
                color: Defaults.clientTextColor
            });
        }
        else {
            this.canvas.drawCircle(circle);
        }
    }

    private drawConnection(t: MessageTransmitter, color: string) {
        if (t.connectedTo) {
            this.canvas.drawLine({
                x1: t.x,
                y1: t.y,
                x2: t.connectedTo.x,
                y2: t.connectedTo.y,
                color
            });
        }
    }

    private drawMessage(message: Message) {
        let color, borderColor;

        switch (message.status) {
            case 'queued':
            case 'done':
                return;
            case 'req':
                color = Defaults.messageReqColor;
                borderColor = Defaults.messageReqBorderColor;
                break;
            case 'ack':
                color = Defaults.messageAckColor;
                borderColor = Defaults.messageAckBorderColor;
                break;
            case 'nack':
                color = Defaults.messageNackColor;
                borderColor = Defaults.messageNackBorderColor;
                break;
            default:
                throw 'Invalid message status: ' + message.status;
        }

        this.canvas.drawCircle({
            x: message.x,
            y: message.y,
            radius: Defaults.messageSize / 2,
            color,
            borderColor
        });
    }

    private drawServer(server: Server) {
        Utilities.drawServer(server, {}, this.canvas);
    }
}