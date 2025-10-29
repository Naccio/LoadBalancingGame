class TutorialStep {

    public hasNext = false;
    public hasHome = false;
    public advance = false;
    public advanceOnSpace = false;

    constructor(public id: number, public texts: [string, string, string]) { }

    setup() { }
    run() { }
    draw() { }
}