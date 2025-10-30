/// <reference path='Commands/NewGame.ts' />
/// <reference path='Model/Attacker.ts' />
/// <reference path='Model/Client.ts' />
/// <reference path='Model/Server.ts' />
/// <reference path='Scenes/Credits.ts' />
/// <reference path='Scenes/Game.ts' />
/// <reference path='Scenes/GameOver.ts' />
/// <reference path='Scenes/Menu.ts' />
/// <reference path='Scenes/Pause.ts' />
/// <reference path='Scenes/Tutorial/Tutorial.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep1.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep2.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep3.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep4.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep5.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep6.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep7.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep8.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep9.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep10.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep11.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep12.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep13.ts' />
/// <reference path='Scenes/Tutorial/TutorialStep14.ts' />
/// <reference path='Scenes/Upgrade.ts' />
/// <reference path='Services/GameTracker.ts' />
/// <reference path='Services/Scheduler.ts' />
/// <reference path='UI/BorderButton.ts' />
/// <reference path='UI/Button.ts' />
/// <reference path='UI/CursorTracker.ts' />
/// <reference path='UI/FpsCounter.ts' />
/// <reference path='UI/GameArea.ts' />
/// <reference path='UI/GameUI.ts' />
/// <reference path='UI/SpecialButton.ts' />
/// <reference path='UI/TextFader.ts' />

declare const $clouds: any;

class Application {
    private activeScene: Scene;

    public logActive = false;

    constructor(
        private scenes: Scene[],
        private game: GameTracker,
        private ui: GameUI,
        private cursor: CursorTracker,
        private context: CanvasRenderingContext2D,
        private fpsCounter: FpsCounter
    ) {
        this.activeScene = scenes[0];

        document.addEventListener("keypress", e => this.keyboardHandler(e));

        window.addEventListener('blur', () => this.blurHandler());
    }

    public static build() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = canvas.getContext("2d")!;
        const w = canvas.width;
        const h = canvas.height;

        const fader = new TextFader(context);
        const fpsCounter = new FpsCounter();
        const music = new Audio("assets/music.mp3");

        const orchestrator = new MessageOrchestrator();
        const upgradesTracker = new UpgradesTracker();
        const popularityTracker = new PopularityTracker(fader, upgradesTracker);
        const ui = new GameUI(music, canvas);
        const game = new GameTracker(popularityTracker, ui);
        const cursor = new CursorTracker(game, canvas, ui);
        const sched = new Scheduler(popularityTracker, fader, orchestrator, canvas, game);
        const gameArea = new GameArea(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader);

        const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, sched, fader);

        const credits = new Credits(canvas, $clouds, game);
        const gameOver = new GameOver(canvas, $clouds, game, orchestrator, popularityTracker, newGame);
        const pause = new Pause(canvas, $clouds, game, upgradesTracker, ui, newGame);
        const upgrade = new Upgrade(canvas, game, upgradesTracker, sched, gameArea, fader);
        const gameScene = new Game(canvas, game, sched, orchestrator, gameArea, fader);
        const tutorial = new Tutorial([
            new TutorialStep1(canvas, game),
            new TutorialStep2(canvas),
            new TutorialStep3(canvas, game, orchestrator, popularityTracker),
            new TutorialStep4(game),
            new TutorialStep5(canvas, game, orchestrator, popularityTracker),
            new TutorialStep6(canvas, game, orchestrator, popularityTracker),
            new TutorialStep7(canvas, game, orchestrator, popularityTracker),
            new TutorialStep8(canvas, game, orchestrator, popularityTracker, fader),
            new TutorialStep9(canvas, game, fader),
            new TutorialStep10(canvas, game, orchestrator, popularityTracker),
            new TutorialStep11(canvas, game, orchestrator, popularityTracker, fader),
            new TutorialStep12(canvas, game, fader),
            new TutorialStep13(canvas, game, orchestrator, popularityTracker),
            new TutorialStep14(canvas, game, orchestrator, popularityTracker, newGame)
        ], canvas, gameArea, fader, game, orchestrator);
        const menu = new Menu(canvas, $clouds, game, ui, tutorial, newGame);

        cursor.bind();

        music.loop = true;
        //music.play();

        $clouds.createCloud(w / 4, h / 4, 220);
        $clouds.createCloud(0 - w / 4, h / 2, 220);
        $clouds.createCloud(w / 2, h / 2, 220, 40);
        $clouds.createCloud(0 - w / 2, h * 3 / 4, 220);
        $clouds.createCloud(w * 3 / 4, h / 4, 220);
        $clouds.createCloud(0 - w * 3 / 4, h / 2, 220);

        return new Application([
            menu,
            gameScene,
            gameOver,
            credits,
            pause,
            upgrade,
            tutorial
        ], game, ui, cursor, context, fpsCounter);
    }

    public run() {
        setInterval(() => this.mainLoop(), 1000 / Defaults.frameRate);
    }

    private mainLoop() {
        if (this.activeScene.id !== this.game.currentGameMode) {
            this.activeScene = this.scenes.find(s => s.id === this.game.currentGameMode)!;
        }

        this.activeScene.update();
        this.ui.buttons = this.activeScene.getButtons();
        this.drawButtons();

        if (this.logActive) {
            this.fpsCounter.update();
            this.fpsCounter.logFps();
        }
    }

    private drawButtons() {
        const mouseX = this.cursor.mouseX,
            mouseY = this.cursor.mouseY;

        this.ui.buttons.forEach((button) => {
            const hovered =
                mouseX > button.x - (button.width + 2) / 2 &&
                mouseX < button.x + (button.width + 2) / 2 &&
                mouseY > button.y - (button.height + 4) / 2 &&
                mouseY < button.y + (button.height + 2) / 2;

            button.draw(hovered, this.context);
        });
    }

    private blurHandler() {
        if (this.game.currentGameMode === Defaults.gameModes.GAME) {
            this.game.switchMode(Defaults.gameModes.PAUSE);
        }
    }

    private keyboardHandler(event: KeyboardEvent) {
        event.preventDefault();
        switch (event.key) {
            case ' ':
                const game = this.game;
                if (game.currentGameMode === Defaults.gameModes.GAME) {
                    game.switchMode(Defaults.gameModes.PAUSE);
                } else if (game.currentGameMode === Defaults.gameModes.PAUSE) {
                    game.switchMode(Defaults.gameModes.GAME);
                }
        }
    }
}

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext("2d")!; //TODO: Remove after upgrading Clouds.js
const app = Application.build();

app.logActive = true;

app.run();