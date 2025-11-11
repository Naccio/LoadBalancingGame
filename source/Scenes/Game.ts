/// <reference path='../Defaults.ts' />
/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/Scheduler.ts' />
/// <reference path='../UI/Button.ts' />
/// <reference path='../UI/GameArea.ts' />
/// <reference path='../UI/TextFader.ts' />
/// <reference path='Scene.ts' />

class Game implements Scene {
    public id = Defaults.gameModes.GAME;

    constructor(
        private canvas: Canvas,
        private game: GameTracker,
        private scheduler: Scheduler,
        private gameArea: GameArea,
        private fader: TextFader
    ) { }

    getButtons(): Button[] {
        return [];
    }

    draw() {
        this.canvas.clear();
        this.gameArea.draw();
    }

    update() {
        if (this.game.servers.length === 0) {
            this.scheduler.createServer('c');
        }
        this.game.update();
        this.fader.update(1 / Defaults.frameRate);
        this.scheduler.schedule();

        var m = Math.floor(this.game.elapsedTime / 60);

        if (m === Defaults.gameLength && this.game.clients.length === 0) {
            this.game.switchMode(Defaults.gameModes.GAME_OVER);
        }
    }
}