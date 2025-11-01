/// <reference path='../../Defaults.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../UI/Button.ts' />
/// <reference path='../../UI/GameArea.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='../Scene.ts' />
/// <reference path='TutorialStep.ts' />

class Tutorial implements Scene {
    private readonly nextButton: Button;
    private readonly homeButton: Button;

    private currentStep: TutorialStep;

    public id = Defaults.gameModes.TUTORIAL;

    public constructor(
        private steps: TutorialStep[],
        private canvas: HTMLCanvasElement,
        private gameArea: GameArea,
        private fader: TextFader,
        private game: GameTracker,
        private orchestrator: MessageOrchestrator
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.currentStep = steps[0];
        this.nextButton = new Button(w / 3, h - 40, 120, 40, 'Next', '#FFFFFF', () => this.advance());
        this.homeButton = new Button(w * 2 / 3, h - 40, 120, 40, "Exit tutorial", "#FFFFFF", () => game.switchMode(Defaults.gameModes.MENU));

        this.currentStep.setup();
        document.addEventListener('keypress', e => this.listener(e));
    }

    getButtons() {
        const buttons = [...this.currentStep.extraButtons];

        if (this.currentStep.hasNext) {
            buttons.push(this.nextButton);
        }

        if (this.currentStep.hasHome) {
            buttons.push(this.homeButton);
        }

        return buttons;
    }

    update() {
        const context = this.canvas.getContext('2d')!,
            w = this.canvas.width,
            h = this.canvas.height,
            texts = this.currentStep.texts,
            rectangle = {
                x: w / 2,
                y: 0,
                width: w,
                height: 80,
                color: '#0360AE',
                borderColor: '#02467F'
            };
        this.currentStep.run();
        this.fader.update(1 / Defaults.frameRate);

        if (this.currentStep.advance) {
            this.advance();
        }

        context.clearRect(0, 0, w, h);
        this.gameArea.draw();
        this.fader.draw();
        Utilities.drawRect({ ...rectangle, y: 40 }, context);
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            Utilities.drawText({
                x: w / 2,
                y: 18 + 20 * i,
                text,
                font: 'bold 18px monospace',
                align: 'center',
                color: 'white'
            }, context);
        }
        Utilities.drawRect({ ...rectangle, y: h - 40 }, context);
        this.currentStep.draw();
    }

    reset() {
        this.game.reset();
        this.orchestrator.reset();
        this.fader.emptyQueues();
        this.currentStep = this.steps[0];
        this.currentStep.setup();
        this.game.switchMode(Defaults.gameModes.TUTORIAL);
    }

    private advance() {
        this.currentStep = this.steps[this.currentStep.id + 1];
        this.currentStep.setup();
    }

    private listener(event: KeyboardEvent) {
        if (event.key === ' ' && this.currentStep.advanceOnSpace) {
            this.advance();
        }
    }
}