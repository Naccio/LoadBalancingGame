/// <reference path='../../Defaults.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='../../Services/MessageOrchestrator.ts' />
/// <reference path='../../UI/SimpleButton.ts' />
/// <reference path='../../UI/GameArea.ts' />
/// <reference path='../../UI/TextFader.ts' />
/// <reference path='../../Utilities.ts' />
/// <reference path='../Scene.ts' />
/// <reference path='TutorialStep.ts' />

class Tutorial implements Scene {
    private readonly nextButton: SimpleButton;
    private readonly homeButton: SimpleButton;

    private currentStep: TutorialStep;
    private currentStepIndex: number;

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
        this.currentStepIndex = 0;
        this.nextButton = Utilities.defaultButton(w / 3, h - 40, 'Next', () => this.advance());
        this.homeButton = Utilities.defaultButton(w * 2 / 3, h - 40, 'Exit tutorial', () => game.switchMode(Defaults.gameModes.MENU));

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
                color: Defaults.backgroundColor,
                borderColor: Defaults.backgroundBorderColor
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
                fontWeight: 'bold',
                fontSize: 18,
                align: 'center',
                color: Defaults.primaryColor
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
        this.currentStepIndex += 1;
        this.currentStep = this.steps[this.currentStepIndex];
        this.currentStep.setup();
    }

    private listener(event: KeyboardEvent) {
        if (event.key === ' ' && this.currentStep.advanceOnSpace) {
            this.advance();
        }
    }
}