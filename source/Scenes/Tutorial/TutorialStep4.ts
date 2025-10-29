/// <reference path='../../Defaults.ts' />
/// <reference path='../../Model/Server.ts' />
/// <reference path='../../Services/GameTracker.ts' />
/// <reference path='TutorialStep.ts' />

class TutorialStep4 extends TutorialStep {

    constructor(private game: GameTracker) {
        super(3, [
            'To create a connection, click on the client and then on the datacenter.',
            'Be quick though! Clients don\'t like waiting!',
            'Create a CONNECTION to continue.']);

        this.hasHome = true;
    }

    run() {
        const client = this.game.clients[0];

        if (client.connectedTo !== undefined) {
            this.advance = true;
        }
        if (client.life >= Defaults.maxClientWaitTime - 1) {
            this.texts = [
                'Snap! You let too much time pass!',
                'Normally this would be bad for you, but this time you\'ll get a little help.',
                'Create a CONNECTION to continue.'];
            client.life = -31;
        }
        this.game.updateClients();
    }
}