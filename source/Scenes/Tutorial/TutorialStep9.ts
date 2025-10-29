/// <reference path='../../Defaults.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../UI/SpecialButton.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep9 extends TutorialStep {

    constructor(
        private canvas: HTMLCanvasElement,
        private game: GameTracker,
        private fader: TextFader
    ) {
        super(8, [
            'Let\'s improve your datacenter\'s speed.',
            'This way it will process the clients\' requests faster.',
            'Select the third upgrade (Improve speed at one location).']);

        //TODO: Unify upgrade buttons code with Pause scene
        const context = canvas.getContext('2d')!,
            w = canvas.width,
            h = canvas.height,
            buttons: SpecialButton[] = [],
            serverSize = Defaults.serverSize;

        const x1 = 250,
            y1 = h / 2 + 150;
        buttons.push(new SpecialButton(x1, y1, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            Utilities.drawText(x1 - 25, y1, '+', '45px monospace', 'center', 'middle', 'red', context);
            Utilities.drawRect(x1 + 15, y1, serverSize, serverSize, '#DDDDDD', 'red', 1, context);
            Utilities.drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);

            if (hovered) {
                Utilities.drawText(w / 2, h - 50, 'Buy new datacenter', '20px monospace', 'center', 'middle', 'red', context);
            }
        }));

        const x2 = w / 2,
            y2 = y1;
        buttons.push(new SpecialButton(x2, y2, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            const queueX = x2 + serverSize / 2 - 7,
                queueY = y2 + 1,
                starX = x2 - serverSize / 2 + 7,
                starY = y2 + serverSize / 2 - 9,
                color = 'red',
                lineWidth = 3;
            Utilities.drawRect(x2, y2, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, 'salmon', 'red', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth, context);
            Utilities.drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            Utilities.drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth, context);

            if (hovered) {
                Utilities.drawText(w / 2, h - 50, 'Scale off at one location', '20px monospace', 'center', 'middle', 'red', context);
            }
        }));

        const x3 = w - 250,
            y3 = y1;
        buttons.push(new SpecialButton(x3, y3, 100, 100, '#333333', 'white', 2, () => {
            this.game.servers[0].speed += Defaults.serversSpeed;
            this.advance = true;
        }, (hovered) => {
            const queueX = x3 + serverSize / 2 - 7,
                queueY = y3 + 1,
                starX = x3 - serverSize / 2 + 7,
                starY = y3 + serverSize / 2 - 9,
                color = 'red',
                lineWidth = 3;
            Utilities.drawRect(x3, y3, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, 'salmon', 'red', 2, context);
            Utilities.drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth, context);
            Utilities.drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth, context);
            Utilities.drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth, context);

            if (hovered) {
                Utilities.drawText(w / 2, h - 50, 'Improve speed at one location', '20px monospace', 'center', 'middle', 'red', context);
            }
        }));

        this.extraButtons = buttons;
    }

    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }

    draw() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height;

        Utilities.drawRect(w / 2, h / 2, w, h - 160, '#0360AE', '', 0, context);
        Utilities.drawText(w / 2, h / 2 + 60, 'Choose an upgrade:', '25px monospace', 'center', 'middle', 'black', context);
        Utilities.drawText(w / 2, h / 3, '~ Paused ~', '50px monospace', 'center', 'middle', 'red', context);
    }
}