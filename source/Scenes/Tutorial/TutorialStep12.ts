/// <reference path='../../Services/ServerFactory.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Upgrades/CapacityUpgradeButton.ts' />
/// <reference path='../../Upgrades/ServerUpgradeButton.ts' />
/// <reference path='../../Upgrades/SpeedUpgradeButton.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep12 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        serverFactory: ServerFactory,
        private fader: TextFader
    ) {
        super([
            'This time let\'s buy a new datacenter.',
            'This way you can connect the clients to it while your first one is under attack.',
            'Select the first upgrade (Buy new datacenter).']);

        const w = canvas.width,
            h = canvas.height,
            y = h / 2 + 150;

        this.extraButtons = [
            new ServerUpgradeButton(250, y, () => {
                const server = serverFactory.create(w / 2, h / 4);
                server.capacity = 20;
                this.advance = true;
            }),
            new CapacityUpgradeButton(w / 2, y),
            new SpeedUpgradeButton(w - 250, y)
        ];
    }

    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        Utilities.drawRect({
            x: w / 2,
            y: h / 2,
            width: w,
            height: h - 158,
            color: '#0360AE'
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 2 + 60,
            text: 'Choose an upgrade:',
            fontSize: 25,
            align: 'center',
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 3,
            text: '~ Paused ~',
            fontSize: 50,
            align: 'center',
            color: 'red'
        }, context);
    }
}