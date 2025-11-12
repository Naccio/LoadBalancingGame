/// <reference path='../Model/Point.ts' />
/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/GameUI.ts' />

class CursorTracker {
    public mousePosition: Point;

    public constructor(private game: GameTracker, private canvas: HTMLCanvasElement, private ui: GameUI) {
        this.mousePosition = { x: 0, y: 0 };
    }

    bind() {
        this.canvas.onmousedown = (e) => this.mouseDownHandler(e);
        this.canvas.onmouseup = (e) => this.mouseUpHandler(e);
        this.canvas.onclick = (e) => this.clickHandler(e);
        this.canvas.onmousemove = (e) => {
            this.mousePosition = {
                x: e.clientX - this.canvas.offsetLeft,
                y: e.clientY - this.canvas.offsetTop
            };
        };

        this.canvas.ontouchstart = (e) => this.touchHandler(e);
        this.canvas.ontouchmove = (e) => this.touchHandler(e);
        this.canvas.ontouchend = (e) => this.touchHandler(e);
        this.canvas.ontouchcancel = (e) => this.touchHandler(e);
    }

    private clickHandler(event: MouseEvent) {
        const canvas = this.canvas,
            x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;

        this.ui.click(x, y);
    }

    private cursorPositionHandler(x: number, y: number) {
        const game = this.game,
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
        const canvas = this.canvas,
            x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;

        this.cursorPositionHandler(x, y);
    }

    private mouseUpHandler(event: MouseEvent) {
        const game = this.game,
            canvas = this.canvas,
            gameModes = Defaults.gameModes,
            serverSize = Defaults.serverSize;

        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {
            const x = event.pageX - canvas.offsetLeft,
                y = event.pageY - canvas.offsetTop;

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
            x = touch.pageX - canvas.offsetLeft,
            y = touch.pageY - canvas.offsetTop;

        event.preventDefault();

        if (event.type == 'touchstart') {
            this.mousePosition = { x, y };

            this.ui.click(x, y);
            this.cursorPositionHandler(x, y);
        }
        else if (event.type == 'touchmove') {
            this.mousePosition = { x, y };
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