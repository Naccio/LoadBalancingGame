/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='MessageOrchestrator.ts' />

class AttackerFactory {

    constructor(
        private game: GameTracker,
        private orchestrator: MessageOrchestrator
    ) { }

    create(x: number, y: number, messages: number, server: Server) {
        const attacker = new Attacker(this.orchestrator, x, y, messages, server);

        this.game.attackers.push(attacker);

        return attacker;
    }
}