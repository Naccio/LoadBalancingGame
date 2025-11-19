/// <reference path='../Model/Point.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/GameUI.ts' />

class CursorTracker {
    public mousePosition: Point;

    public constructor(private game: GameTracker, private canvas: Canvas, private ui: GameUI) {
        this.mousePosition = { x: 0, y: 0 };
    }

    bind() {
        document.onmousedown = (e) => this.mouseDownHandler(e);
        document.onmouseup = (e) => this.mouseUpHandler(e);
        document.onclick = (e) => this.clickHandler(e);
        document.onmousemove = (e) => {
            this.mousePosition = this.canvas.getRelativePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        document.ontouchstart = (e) => this.touchHandler(e);
        document.ontouchmove = (e) => this.touchHandler(e);
        document.ontouchend = (e) => this.touchHandler(e);
        document.ontouchcancel = (e) => this.touchHandler(e);
    }

    private clickHandler(event: MouseEvent) {
        const mousePosition = this.canvas.getRelativePosition({
                x: event.clientX,
                y: event.clientY
            });

        this.ui.click(mousePosition);
    }

    private cursorPositionHandler(position: Point) {
        const game = this.game,
            { x, y } = position,
            gameModes = Defaults.gameModes,
            clientSize = Defaults.clientSize,
            serverSize = Defaults.serverSize;

        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {

            //check if a server has been clicked
            if (game.selectedClient !== undefined) {
                game.servers.forEach(function (server) {
                    const p = server.position;
                    if (x > p.x - serverSize / 2 - 5 && x < p.x + serverSize / 2 + 5 &&
                        y > p.y - serverSize / 2 - 5 && y < p.y + serverSize / 2 + 5) {
                        game.selectedClient!.connectedTo = server;
                    }
                });
            }

            game.selectedClient = undefined;

            //check if a client has been clicked
            game.clients.forEach((client) => {
                const p = client.position;
                if (x > p.x - clientSize / 2 - 5 && x < p.x + clientSize / 2 + 5 &&
                    y > p.y - serverSize / 2 - 5 && y < p.y + serverSize / 2 + 5) {
                    if (client.connectedTo === undefined) {
                        game.selectedClient = client;
                        this.mousePosition = { ...p };
                    }
                }
            });
        }
    }

    private mouseDownHandler(event: MouseEvent) {
        const mousePosition = this.canvas.getRelativePosition({
            x: event.clientX,
            y: event.clientY
        });

        this.cursorPositionHandler(mousePosition);
    }

    private mouseUpHandler(event: MouseEvent) {
        const game = this.game,
            gameModes = Defaults.gameModes,
            serverSize = Defaults.serverSize;

        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {
            const { x, y } = this.canvas.getRelativePosition({
                x: event.clientX,
                y: event.clientY
            });

            //check if a server has been clicked
            if (game.selectedClient !== undefined) {
                game.servers.forEach(function (server) {
                    const p = server.position;
                    if (x > p.x - serverSize / 2 - 5 && x < p.x + serverSize / 2 + 5 &&
                        y > p.y - serverSize / 2 - 5 && y < p.y + serverSize / 2 + 5) {
                        game.selectedClient!.connectedTo = server;
                        game.selectedClient = undefined;
                    }
                });
            }
        }
    }

    private touchHandler(event: TouchEvent) {
        const game = this.game,
            canvas = this.canvas,
            touch = event.targetTouches[0],
            mousePosition = this.canvas.getRelativePosition({
                x: touch.clientX,
                y: touch.clientY
            });

        event.preventDefault();

        if (event.type == 'touchstart') {
            this.mousePosition = mousePosition;

            this.ui.click(mousePosition);
            this.cursorPositionHandler(mousePosition);
        }
        else if (event.type == 'touchmove') {
            this.mousePosition = mousePosition;
        }
        else if (event.type == 'touchend') {
            if (game.selectedClient !== undefined) {
                const mp = this.mousePosition,
                    cp = game.selectedClient.position,
                    serverSize = Defaults.serverSize,
                    clientSize = Defaults.clientSize;

                game.servers.forEach(function (server) {
                    const sp = server.position;
                    if (mp.x > sp.x - serverSize / 2 - 5 && mp.x < sp.x + serverSize / 2 + 5
                        && mp.y > sp.y - serverSize / 2 - 5 && mp.y < sp.y + serverSize / 2 + 5) {
                        game.selectedClient!.connectedTo = server;
                    }
                });
                if (mp.x < cp.x - clientSize / 2 - 5 || mp.x > cp.x + clientSize / 2 + 5
                    || mp.y < cp.y - clientSize / 2 - 5 || mp.y > cp.y + clientSize / 2 + 5) {
                    game.selectedClient = undefined;
                }
            }
        }
    }
}