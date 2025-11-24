/// <reference path='Commands/NewGame.ts' />
/// <reference path='Scenes/Credits.ts' />
/// <reference path='Scenes/Game.ts' />
/// <reference path='Scenes/GameOver.ts' />
/// <reference path='Scenes/Menu.ts' />
/// <reference path='Scenes/Pause.ts' />
/// <reference path='Scenes/Tutorial/ClientExplanation.ts' />
/// <reference path='Scenes/Tutorial/ClientSuccessExplanation.ts' />
/// <reference path='Scenes/Tutorial/ConnectionExplanation.ts' />
/// <reference path='Scenes/Tutorial/ConnectMoreClients.ts' />
/// <reference path='Scenes/Tutorial/ConnectToNewServer.ts' />
/// <reference path='Scenes/Tutorial/DdosAttackExample.ts' />
/// <reference path='Scenes/Tutorial/NewServerUpgradeExample.ts' />
/// <reference path='Scenes/Tutorial/PopularityExplanation.ts' />
/// <reference path='Scenes/Tutorial/ServerBusyExample.ts' />
/// <reference path='Scenes/Tutorial/ServerExplanation.ts' />
/// <reference path='Scenes/Tutorial/SpeedUpgradeExample.ts' />
/// <reference path='Scenes/Tutorial/Tutorial.ts' />
/// <reference path='Scenes/Tutorial/TutorialFinished.ts' />
/// <reference path='Scenes/Tutorial/UpgradesIntroduction.ts' />
/// <reference path='Scenes/Tutorial/Welcome.ts' />
/// <reference path='Scenes/Upgrade.ts' />
/// <reference path='Services/AttackerFactory.ts' />
/// <reference path='Services/ClientFactory.ts' />
/// <reference path='Services/GameTracker.ts' />
/// <reference path='Services/MessageOrchestrator.ts' />
/// <reference path='Services/PopularityTracker.ts' />
/// <reference path='Services/Scheduler.ts' />
/// <reference path='UI/CursorTracker.ts' />
/// <reference path='UI/FpsCounter.ts' />
/// <reference path='UI/GameArea.ts' />
/// <reference path='UI/GameUI.ts' />
/// <reference path='UI/TextFader.ts' />

declare class Clouds {
    add(x: number, y: number, w: number, h: number, circles: number, color: { r: number, g: number, b: number, a: number }, speed: number): void;
    draw(): void;
    setSkyColor(color: string): void;
    update(elapsed: number): void;
}

class Application {
    private activeScene: Scene;

    public logActive = false;

    constructor(
        private scenes: Scene[],
        private game: GameTracker,
        private ui: GameUI,
        private cursor: CursorTracker,
        private canvas: Canvas,
        private fpsCounter: FpsCounter,
        private clouds: Clouds
    ) {
        const w = canvas.width,
            h = canvas.height;

        this.activeScene = scenes[0];

        clouds.setSkyColor(Defaults.backgroundColor);
        this.createCloud(w / 4, h / 4);
        this.createCloud(0 - w / 4, h / 3);
        this.createCloud(w / 2, h / 2);
        this.createCloud(0 - w / 2, h * 3 / 4);
        this.createCloud(w * 3 / 4, h * 2 / 3);
        this.createCloud(0 - w * 3 / 4, h / 2);

        document.addEventListener('keypress', e => this.keyboardHandler(e));

        window.addEventListener('blur', () => this.blurHandler());
    }

    public static build(clouds: Clouds) {
        const canvasElement = <HTMLCanvasElement>document.getElementById('canvas');

        const music = new Audio('assets/music.mp3');

        const canvas = new Canvas(canvasElement);
        const fader = new TextFader(canvas);
        const fpsCounter = new FpsCounter();
        const orchestrator = new MessageOrchestrator();
        const upgradesTracker = new UpgradesTracker();
        const popularityTracker = new PopularityTracker(fader, upgradesTracker, canvas);
        const ui = new GameUI(music, canvas);
        const game = new GameTracker(popularityTracker, ui, orchestrator);
        const attackerFactory = new AttackerFactory(game, orchestrator);
        const clientFactory = new ClientFactory(game, orchestrator, popularityTracker);
        const serverFactory = new ServerFactory(game);
        const cursor = new CursorTracker(game, canvas, ui);
        const scheduler = new Scheduler(popularityTracker, canvas, game, clientFactory, attackerFactory, serverFactory);
        const gameArea = new GameArea(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader);

        const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, scheduler, fader);

        const credits = new Credits(canvas, clouds, game);
        const gameOver = new GameOver(canvas, clouds, game, orchestrator, popularityTracker, newGame);
        const pause = new Pause(canvas, clouds, game, upgradesTracker, ui, newGame);
        const upgrade = new Upgrade(canvas, game, upgradesTracker, scheduler, gameArea, fader);
        const gameScene = new Game(canvas, game, scheduler, gameArea, fader);
        const tutorial = new Tutorial([
            new Welcome(canvas, serverFactory),
            new ServerExplanation(canvas),
            new ClientExplanation(canvas, clientFactory),
            new ConnectionExplanation(game),
            new PopularityExplanation(canvas, game, popularityTracker),
            new ConnectMoreClients(canvas, game, popularityTracker, clientFactory),
            new ServerBusyExample(canvas, game, popularityTracker),
            new UpgradesIntroduction(canvas, game, popularityTracker, fader),
            new SpeedUpgradeExample(canvas, game, fader),
            new ClientSuccessExplanation(canvas, game, orchestrator, popularityTracker),
            new DdosAttackExample(canvas, game, fader, clientFactory, attackerFactory),
            new NewServerUpgradeExample(canvas, serverFactory, fader),
            new ConnectToNewServer(canvas, game, popularityTracker, clientFactory),
            new TutorialFinished(canvas, game, popularityTracker, newGame)
        ], canvas, gameArea, fader, game, orchestrator);
        const menu = new Menu(canvas, clouds, game, ui, tutorial, newGame);

        cursor.bind();

        music.loop = true;
        //music.play();

        return new Application([
            menu,
            gameScene,
            gameOver,
            credits,
            pause,
            upgrade,
            tutorial
        ], game, ui, cursor, canvas, fpsCounter, clouds);
    }

    public run() {
        const elapsed = 1000 / Defaults.frameRate;

        setInterval(() => this.mainLoop(elapsed), elapsed);
    }

    private mainLoop(elapsed: number) {
        if (this.activeScene.id !== this.game.currentGameMode) {
            this.activeScene = this.scenes.find(s => s.id === this.game.currentGameMode)!;
        }

        this.clouds.update(elapsed);
        this.activeScene.update(elapsed);
        this.activeScene.draw();
        this.ui.buttons = this.activeScene.getButtons();
        this.drawButtons();

        if (this.logActive) {
            this.fpsCounter.update();
            this.fpsCounter.logFps();
        }
    }

    private createCloud(x: number, y: number) {
        const p = this.canvas.getActualPosition({ x, y }),
            w = this.canvas.getActualMeasure(MathHelper.random(350, 500)),
            h = this.canvas.getActualMeasure(MathHelper.random(w, 700)),
            circles = MathHelper.random(15, 30),
            n = MathHelper.random(180, 255),
            color = { r: n, g: n, b: n, a: .1 },
            speed = MathHelper.random(100, 200);

        this.clouds.add(p.x, p.y, w, h, circles, color, speed);
    }

    private drawButtons() {
        const mp = this.cursor.mousePosition;

        this.ui.buttons.forEach((button) => {
            const bp = button.position,
                hovered =
                    mp.x > bp.x - (button.width + 2) / 2 &&
                    mp.x < bp.x + (button.width + 2) / 2 &&
                    mp.y > bp.y - (button.height + 4) / 2 &&
                    mp.y < bp.y + (button.height + 2) / 2;

            button.draw(hovered, this.canvas);
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