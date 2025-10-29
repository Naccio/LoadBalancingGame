/// <reference path='../../UI/Button.ts' />

class TutorialStep {

    public hasNext = false;
    public hasHome = false;
    public advance = false;
    public advanceOnSpace = false;
    public extraButtons: Button[] = [];

    constructor(public id: number, public texts: [string, string, string]) { }

    setup() { }
    run() { }
    draw() { }
}