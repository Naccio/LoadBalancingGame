/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../Services/MessageOrchestrator.ts' />
/// <reference path='../Services/PopularityTracker.ts' />
/// <reference path='../Services/Scheduler.ts' />
/// <reference path='../Services/UpgradesTracker.ts' />

class NewGame {
    constructor(
        private orchestrator: MessageOrchestrator,
        private upgrades: UpgradesTracker,
        private popularity: PopularityTracker,
        private game: GameTracker,
        private scheduler: Scheduler
    ) { }

    execute() {
        this.orchestrator.reset();
        this.upgrades.reset();
        this.popularity.reset();
        this.game.reset();
        this.scheduler.reset();
    }
}