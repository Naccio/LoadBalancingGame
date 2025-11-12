/// <reference path='../Model/Attacker.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='../Model/Server.ts' />
/// <reference path='GameTracker.ts' />
/// <reference path='MessageOrchestrator.ts' />

class AttackerFactory {

    constructor(
        private game: GameTracker,
        private orchestrator: MessageOrchestrator
    ) { }

    create(position: Point, messages: number, server: Server) {
        const attacker = new Attacker(this.orchestrator, position, messages, server);

        this.game.attackers.push(attacker);

        return attacker;
    }
}