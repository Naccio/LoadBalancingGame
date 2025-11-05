/// <reference path='../../Services/AttackerFactory.ts' />
/// <reference path='../../Services/ClientFactory.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialHelper.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep11 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private fader: TextFader,
        private clientFactory: ClientFactory,
        private attackerFactory: AttackerFactory
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
            text = {
                x: w / 2,
                y: h - 116,
                fontSize: 20,
                rgbColor: { r: 255, g: 0, b: 0 },
                id: 'upgradeTut',
                text: '- Upgrade available! -',
                life: 1000,
                alpha: 0,
                delta: 0
            };

        this.attackerFactory.create(w / 2, h * 3 / 4, 10000, server);
        this.attackerFactory.create(w / 3, h * 2 / 3, 10000, server);
        this.attackerFactory.create(w * 2 / 3, h * 2 / 3, 10000, server);

        this.spawnClients();
        this.fader.addPermanentText(text);
    }

    run() {
        if (this.game.selectedClient) {
            this.game.selectedClient = undefined;
        }
        if (this.game.clients.length === 0) {
            this.spawnClients();
        }
        this.game.update();
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        TutorialHelper.drawLegend(this.canvas, true);

        Utilities.drawText({
            x: w / 2,
            y: h - 95,
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            color: 'darkGray'
        }, context);
    }

    private spawnClients() {
        const w = this.canvas.width,
            h = this.canvas.height,
            client0 = this.clientFactory.create(w / 4, h / 3, 10000),
            client1 = this.clientFactory.create(w * 3 / 4, h / 3, 10000);

        client0.life = - 21;
        client1.life = - 21;
    }
}