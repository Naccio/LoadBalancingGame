/// <reference path='../../Defaults.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Upgrades/CapacityUpgradeButton.ts' />
/// <reference path='../../Upgrades/ServerUpgradeButton.ts' />
/// <reference path='../../Upgrades/SpeedUpgradeButton.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class SpeedUpgradeExample extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private fader: TextFader
    ) {
        super([
            'Let\'s improve your datacenter\'s speed.',
            'This way it will process the clients\' requests faster.',
            'Select the third upgrade (Improve speed at one location).']);

        const w = canvas.width,
            h = canvas.height,
            y = h / 2 + 150;

        this.extraButtons = [
            new ServerUpgradeButton(250, y),
            new CapacityUpgradeButton(w / 2, y),
            new SpeedUpgradeButton(w - 250, y, () => {
                this.game.servers[0].speed += Defaults.serversSpeed;
                this.advance = true;
            })
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