/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Client.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../Services/PopularityTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep11 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator,
        private popularityTracker: PopularityTracker,
        private fader: TextFader
    ) {
        super(10, [
            'Oh snap! Your datacenter is under a DDOS ATTACK! And more clients need serving!',
            'This is likely to happen as you get more and more popular.',
            'You\'d better upgrade once again to cope with this situation.']);

        this.hasHome = true;
        this.advanceOnSpace = true;
    }

    setup() {
        const w = this.canvas.width,
            h = this.canvas.height,
            server = this.game.servers[0],
            attacker0 = new Attacker(this.orchestrator, w / 2, h * 3 / 4, 10000, server),
            attacker1 = new Attacker(this.orchestrator, w / 3, h * 2 / 3, 10000, server),
            attacker2 = new Attacker(this.orchestrator, w * 2 / 3, h * 2 / 3, 10000, server),
            text = {
                x: w / 2,
                y: h - 116,
                font: '20px sans-serif',
                fontSize: 20,
                fontWeight: '',
                color: { r: 255, g: 0, b: 0 },
                id: 'upgradeTut',
                text: '- Upgrade available! -',
                life: 1000,
                alpha: 0,
                delta: 0
            };

        this.spawnClients();
        this.game.attackers.push(attacker0, attacker1, attacker2);
        this.fader.addPermanentText(text);
    }

    run() {
        if (this.game.selectedClient) {
            this.game.selectedClient = undefined;
        }
        if (this.game.clients.length === 0) {
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
            messageSize = Defaults.messageSize,
            serverSize = Defaults.serverSize;

        let font = '18px sans-serif';
        Utilities.drawText(10, h - 95, 'Popularity: ' + this.popularityTracker.popularity, font, align, baseline, color, context);

        font = '10px sans-serif';
        Utilities.drawText(w - 118 + messageSize / 2, 100, ': Request', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + messageSize + 5, ': Response (+1)', font, align, baseline, color, context);
        Utilities.drawText(w - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ': Datacenter busy (-1)', font, align, baseline, color, context);
        Utilities.drawCircle(w - 120, 100, messageSize / 2, 'lightBlue', 'skyBlue', 2, context);
        Utilities.drawCircle(w - 120, 100 + messageSize + 5, messageSize / 2, 'lime', 'limeGreen', 2, context);
        Utilities.drawCircle(w - 120, 100 + 2 * (messageSize + 5), messageSize / 2, 'tomato', 'indianRed', 2, context);

        Utilities.drawText(w / 2, h - 95, 'Press space to pause', '18px sans-serif', 'center', baseline, 'darkGray', context);
    }

    private spawnClients() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client0 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 3, 10000),
            client1 = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 3, 10000);

        client0.life = - 21;
        client1.life = - 21;

        this.game.clients.push(client0, client1);
    }
}