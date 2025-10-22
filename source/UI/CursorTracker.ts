/// <reference path='../Services/GameTracker.ts' />
/// <reference path='../UI/GameUI.ts' />

class CursorTracker {
    public mouseX = 0;
    public mouseY = 0;

    public constructor(private game: GameTracker, private canvas: HTMLCanvasElement, private ui: GameUI) {
    }

    bind() {
        this.canvas.onmousedown = (e) => this.mouseDownHandler(e);
        this.canvas.onmouseup = (e) => this.mouseUpHandler(e);
        this.canvas.onclick = (e) => this.clickHandler(e);
        this.canvas.onmousemove = (e) => {
            this.mouseX = e.clientX - this.canvas.offsetLeft;
            this.mouseY = e.clientY - this.canvas.offsetTop;
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
                    if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
                        y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
                        game.selectedClient!.connectedTo = server;
                    }
                });
            }

            game.selectedClient = undefined;

            //check if a client has been clicked
            game.clients.forEach((client) => {
                if (x > client.x - clientSize / 2 - 5 && x < client.x + clientSize / 2 + 5 &&
                    y > client.y - serverSize / 2 - 5 && y < client.y + serverSize / 2 + 5) {
                    if (client.connectedTo === undefined) {
                        game.selectedClient = client;
                        this.mouseX = client.x;
                        this.mouseY = client.y;
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
                    if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
                        y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
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

        if (event.type == "touchstart") {
            this.mouseX = x;
            this.mouseY = y;

            this.ui.click(x, y);
            this.cursorPositionHandler(x, y);
        }
        else if (event.type == "touchmove") {
            this.mouseX = x;
            this.mouseY = y;
        }
        else if (event.type == "touchend") {
            if (game.selectedClient !== undefined) {
                const mouseX = this.mouseX,
                    mouseY = this.mouseY,
                    serverSize = Defaults.serverSize,
                    clientSize = Defaults.clientSize;

                game.servers.forEach(function (server) {
                    if (mouseX > server.x - serverSize / 2 - 5 && mouseX < server.x + serverSize / 2 + 5
                        && mouseY > server.y - serverSize / 2 - 5 && mouseY < server.y + serverSize / 2 + 5) {
                        game.selectedClient!.connectedTo = server;
                    }
                });
                if (mouseX < game.selectedClient.x - clientSize / 2 - 5 || mouseX > game.selectedClient.x + clientSize / 2 + 5
                    || mouseY < game.selectedClient.y - clientSize / 2 - 5 || mouseY > game.selectedClient.y + clientSize / 2 + 5) {
                    game.selectedClient = undefined;
                }
            }
        }
    }
}