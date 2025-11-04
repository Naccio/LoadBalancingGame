/// <reference path='../../UI/SimpleButton.ts' />

class TutorialStep {

    public hasNext = false;
    public hasHome = false;
    public advance = false;
    public advanceOnSpace = false;
    public extraButtons: SimpleButton[] = [];

    constructor(public id: number, public texts: [string, string, string]) { }

    setup() { }
    run() { }
    draw() { }
}