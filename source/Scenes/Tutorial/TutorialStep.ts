/// <reference path='../../UI/Button.ts' />

class TutorialStep {

    public hasNext = false;
    public hasHome = false;
    public advance = false;
    public advanceOnSpace = false;
    public extraButtons: Button[] = [];

    constructor(public texts: [string, string, string]) { }

    setup() { }
    update(elapsed: number) { }
    draw() { }
}