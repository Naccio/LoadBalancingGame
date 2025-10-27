"use strict";
class Message {
    sender;
    receiver;
    x;
    y;
    dx;
    dy;
    status;
    life;
    constructor(sender, receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.x = sender.x;
        this.y = sender.y;
        this.dx = 0;
        this.dy = 0;
        this.sender = sender;
        this.receiver = receiver;
        this.status = "req";
        this.life = 0;
        this.computeVelocity();
    }
    computeVelocity() {
        var xDiff = this.receiver.x - this.x, yDiff = this.receiver.y - this.y, angle = Math.atan2(yDiff, xDiff), v = Defaults.messageVelocity / Defaults.frameRate;
        this.dx = Math.cos(angle) * v;
        this.dy = Math.sin(angle) * v;
    }
    ;
    move() {
        this.x += this.dx;
        this.y += this.dy;
    }
    ;
    invertDirection() {
        const tmp = this.sender;
        this.sender = this.receiver;
        this.receiver = tmp;
        this.computeVelocity();
    }
    ;
}
class MessageOrchestrator {
    messages = [];
    totalAcks = 0;
    avgResponseTime = 0;
    createMessage(sender, receiver) {
        const m = new Message(sender, receiver);
        m.computeVelocity();
        this.messages.push(m);
    }
    registerAck(message) {
        this.totalAcks += 1;
        this.avgResponseTime = (message.life + (this.totalAcks - 1) * this.avgResponseTime) / this.totalAcks;
    }
    reset() {
        this.messages = [];
        this.totalAcks = 0;
        this.avgResponseTime = 0;
    }
    updateMessages() {
        const clientSize = Defaults.clientSize;
        for (let i = 0; i < this.messages.length; i += 1) {
            var m = this.messages[i];
            m.life += 1 / Defaults.frameRate;
            if (m.status === "req") {
                if (m.sender.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }
            if (m.status === "ack" || m.status === "nack") {
                if (m.receiver.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }
            if (m.status === "done") {
                this.messages.splice(i--, 1);
                continue;
            }
            if (m.status != "queued") {
                var r = m.receiver;
                if (m.x < r.x + clientSize / 2 && m.x > r.x - clientSize / 2 &&
                    m.y < r.y + clientSize / 2 && m.y > r.y - clientSize / 2)
                    r.receiveMessage(m);
                else
                    m.move();
            }
        }
    }
}
class Attacker {
    orchestrator;
    x;
    y;
    msgNr;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    messagesToReceive;
    constructor(orchestrator, x, y, msgNr, connectedTo) {
        this.orchestrator = orchestrator;
        this.x = x;
        this.y = y;
        this.msgNr = msgNr;
        this.connectedTo = connectedTo;
        this.x = x;
        this.y = y;
        this.connectedTo = connectedTo;
        this.lastMessageTime = 0;
        this.messagesToSend = msgNr;
        this.messagesToReceive = msgNr;
    }
    sendMessage(elapsedTime) {
        this.orchestrator.createMessage(this, this.connectedTo);
        this.messagesToSend -= 1;
        this.lastMessageTime = elapsedTime;
    }
    ;
    receiveMessage(message) {
        message.status = "done";
        this.messagesToReceive -= 1;
    }
    ;
}
class TextFader {
    context;
    queues;
    constructor(context) {
        this.context = context;
        this.queues = { permanent: [], temporary: [] };
    }
    draw() {
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];
            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                this.drawText(text, queue.x, queue.y);
            }
        }
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];
            this.drawText(text, text.x ?? 0, text.y ?? 0);
        }
    }
    ;
    update(deltaTime) {
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];
            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                text.delta += 70 * deltaTime;
                if (text.fadeIn) {
                    text.alpha += 0.02;
                    if (text.alpha >= 1) {
                        text.fadeIn = false;
                    }
                }
                else {
                    text.alpha -= 0.02;
                    if (text.alpha <= 0) {
                        queue.activeTexts.splice(j--, 1);
                        continue;
                    }
                }
            }
            if (queue.queuedTexts.length > 0) {
                if (queue.activeTexts.length === 0) {
                    queue.activeTexts.push(queue.queuedTexts.shift());
                }
                else if (queue.activeTexts[queue.activeTexts.length - 1].delta > queue.queuedTexts[0].fontSize) {
                    queue.activeTexts.push(queue.queuedTexts.shift());
                }
            }
        }
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];
            if (text.fadeIn) {
                text.alpha += 0.05;
                if (text.alpha >= 1) {
                    text.fadeIn = false;
                }
            }
            else {
                text.alpha -= 0.05;
                if (text.alpha <= 0) {
                    text.fadeIn = true;
                }
            }
        }
    }
    addText(text, queueId) {
        if (!text.life) {
            text.life = 1000;
        }
        if (text.fadeIn) {
            text.alpha = 0;
        }
        else {
            text.alpha = 1;
        }
        text.delta = 0;
        text.font = text.fontWeight + " " + text.fontSize + "px Arial";
        this.queues.temporary.find(q => q.id == queueId)?.queuedTexts.push(text);
    }
    ;
    addPermanentText(text) {
        for (let i = 0; i < this.queues.permanent.length; i++) {
            if (this.queues.permanent[i].id === text.id) {
                return;
            }
        }
        if (!text.life) {
            text.life = 1000;
        }
        text.alpha = 0;
        text.fadeIn = true;
        this.queues.permanent.push(text);
    }
    ;
    removeFromPermanentQueue(id) {
        for (let i = 0; i < this.queues.permanent.length; i++) {
            if (this.queues.permanent[i].id === id) {
                this.queues.permanent.splice(i, 1);
                return;
            }
        }
    }
    ;
    createQueue(id, x, y) {
        this.queues.temporary.push({
            id: id,
            x: x,
            y: y,
            activeTexts: [],
            queuedTexts: []
        });
    }
    ;
    emptyQueues() {
        this.queues = { permanent: [], temporary: [] };
    }
    ;
    drawText(text, x, y) {
        const delta = text.delta ?? 0, { r, g, b } = text.color, a = text.alpha, color = `rgba(${r}, ${g}, ${b}, ${a})`;
        Utilities.drawText(x, y - delta, text.text, text.font, "center", "middle", color, this.context);
    }
}
class UpgradesTracker {
    upgrades = [100, 200, 300, 500, 700, 1000, 1300, 1700, 2100, 2600, 3100, 3700, 4300, 5000];
    nextUpgradeIndex = 0;
    upgradesAvailable = 0;
    selectedUpgrade;
    get nextUpgrade() {
        if (this.nextUpgradeIndex >= this.upgrades.length) {
            return Infinity;
        }
        return this.upgrades[this.nextUpgradeIndex];
    }
    ;
    increaseUpgrades() {
        this.upgradesAvailable += 1;
        this.nextUpgradeIndex += 1;
    }
    reset() {
        this.nextUpgradeIndex = 0;
        this.upgradesAvailable = 0;
        this.selectedUpgrade = undefined;
    }
}
class PopularityTracker {
    fader;
    upgrades;
    popularity;
    constructor(fader, upgrades) {
        this.fader = fader;
        this.upgrades = upgrades;
        this.popularity = 0;
    }
    reset() {
        this.popularity = 0;
    }
    updatePopularity(amount, x, y) {
        let fontSize = 12, color = { r: 0, g: 150, b: 0 }, borderColor = { r: 150, g: 250, b: 150 }, borderWidth = 1;
        if (amount < 0) {
            color = { r: 150, g: 0, b: 0 };
            borderColor = { r: 250, g: 150, b: 150 };
        }
        if (Math.abs(amount) >= 5) {
            fontSize = 16;
            borderWidth = 2;
        }
        const text = {
            text: amount.toString(),
            color: color,
            fontSize: fontSize,
            fontWeight: "bold",
            border: true,
            borderColor: borderColor,
            borderWidth: borderWidth,
            alpha: 1,
            font: '',
            delta: 0
        };
        this.fader.addText(text, x.toString() + y.toString());
        this.popularity += amount;
        if (this.popularity >= this.upgrades.nextUpgrade) {
            this.upgrades.increaseUpgrades();
        }
    }
}
class Client {
    orchestrator;
    popularity;
    x;
    y;
    msgNr;
    life;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    acksToReceive;
    nacksToDie;
    constructor(orchestrator, popularity, x, y, msgNr) {
        this.orchestrator = orchestrator;
        this.popularity = popularity;
        this.x = x;
        this.y = y;
        this.msgNr = msgNr;
        this.x = x;
        this.y = y;
        this.life = 0;
        this.lastMessageTime = 0;
        this.messagesToSend = msgNr;
        this.acksToReceive = msgNr;
        this.nacksToDie = Math.floor(msgNr / 3);
    }
    sendMessage(elapsedTime) {
        if (!this.connectedTo) {
            throw 'Disconnected client cannot send messages.';
        }
        this.orchestrator.createMessage(this, this.connectedTo);
        this.messagesToSend -= 1;
        this.lastMessageTime = elapsedTime;
    }
    ;
    receiveMessage(message) {
        let n;
        if (message.status === "ack") {
            this.acksToReceive -= 1;
            n = 1;
            if (this.acksToReceive === 0) {
                n += 5;
            }
            this.orchestrator.registerAck(message);
            this.popularity.updatePopularity(n, this.x, this.y);
        }
        else {
            this.nacksToDie -= 1;
            n = -1;
            if (this.nacksToDie > 0) {
                this.messagesToSend += 1;
            }
            else {
                n -= 5;
            }
            this.popularity.updatePopularity(n, this.x, this.y);
        }
        message.status = "done";
    }
    ;
}
class Server {
    x;
    y;
    queue;
    lastMessageTime;
    capacity;
    speed;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.x = x;
        this.y = y;
        this.queue = [];
        this.lastMessageTime = 0;
        this.capacity = Defaults.serversCapacity;
        this.speed = Defaults.serversSpeed;
    }
    sendMessage(elapsedTime) {
        const msg = this.queue.shift();
        if (msg) {
            msg.status = "ack";
            msg.invertDirection();
            this.lastMessageTime = elapsedTime;
        }
    }
    ;
    receiveMessage(message) {
        message.x = this.x;
        message.y = this.y;
        if (this.queue.length < this.capacity) {
            this.queue.push(message);
            message.status = "queued";
        }
        else {
            message.status = "nack";
            message.invertDirection();
        }
    }
    ;
}
class Button {
    x;
    y;
    width;
    height;
    text;
    color;
    onClick;
    constructor(x, y, width, height, text, color, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.onClick = onClick;
    }
    draw(hovered, context) {
        let color;
        if (hovered) {
            Utilities.drawRect(this.x, this.y, this.width, this.height, this.color, this.color, 2, context);
            color = Utilities.invertColor(this.color);
        }
        else {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.color, 2, context);
            color = this.color;
        }
        Utilities.drawText(this.x, this.y, this.text, '15px monospace', 'center', 'middle', color, context);
    }
    ;
}
class GameUI {
    buttons = [];
    volumeButton;
    constructor(music, canvas) {
        const context = canvas.getContext('2d'), WIDTH = canvas.width, HEIGHT = canvas.height, x = WIDTH - 40, y = HEIGHT - 40, w = 20, h = 20;
        this.volumeButton = new SpecialButton(x, y, w, h, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 0, () => {
            if (music.paused) {
                music.play();
            }
            else {
                music.pause();
            }
        }, (hovered) => {
            var clr = hovered ? 'white' : 'rgba(255,255,255,0.8)', status = music.paused ? 'Off' : 'On';
            Utilities.drawRect(x - w / 4 + 1, y, w / 4 + 1, h / 2 - 1, clr, '', 0, context);
            var path = new Path2D();
            path.moveTo(x - 1, y - h / 4);
            path.lineTo(x + w / 4, y - h / 2 + 1);
            path.lineTo(x + w / 4, y + h / 2 - 1);
            path.lineTo(x - 1, y + h / 4);
            path.closePath();
            context.fillStyle = clr;
            context.fill(path);
            if (music.paused) {
                Utilities.drawLine(x - w / 2, y + h / 2, x + w / 2, y - h / 2, "red", 2, context);
                status = "Off";
            }
            if (hovered) {
                Utilities.drawText(x, y + w / 2 + 2, 'Music: ' + status, '10px monospace', 'center', 'top', '#fff', context);
            }
        });
    }
    click(x, y) {
        this.buttons.some((button) => {
            if (x > button.x - button.width / 2 && x < button.x + button.width / 2 &&
                y > button.y - button.height / 2 && y < button.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}
class GameTracker {
    popularityTracker;
    ui;
    selectedClient;
    currentGameMode = 0;
    clientsServed = 0;
    droppedConnections = 0;
    failedConnections = 0;
    elapsedTime = 0;
    servers = [];
    clients = [];
    attackers = [];
    constructor(popularityTracker, ui) {
        this.popularityTracker = popularityTracker;
        this.ui = ui;
    }
    switchMode(gameMode) {
        this.ui.buttons = [];
        this.currentGameMode = gameMode;
    }
    reset() {
        this.selectedClient = undefined;
        this.clientsServed = 0;
        this.droppedConnections = 0;
        this.failedConnections = 0;
        this.elapsedTime = 0;
        this.servers = [];
        this.clients = [];
        this.attackers = [];
        this.switchMode(Defaults.gameModes.GAME);
    }
    update() {
        this.elapsedTime += 1 / Defaults.frameRate;
        this.updateClients();
        this.updateServers();
        this.updateAttackers();
    }
    updateServers() {
        const elapsedTime = this.elapsedTime;
        this.servers.forEach(function (s) {
            if ((elapsedTime - s.lastMessageTime) > 1 / s.speed) {
                s.sendMessage(elapsedTime);
            }
        });
    }
    updateClients() {
        const elapsedTime = this.elapsedTime, remaining = Defaults.gameLength * 60 - elapsedTime;
        for (let i = 0; i < this.clients.length; i++) {
            var c = this.clients[i];
            if (remaining <= 0 && c.messagesToSend > 0) {
                c.acksToReceive -= c.messagesToSend;
                c.messagesToSend = 0;
            }
            if (c.messagesToSend === 0 && c.acksToReceive === 0) {
                this.clients.splice(i--, 1);
                this.clientsServed += 1;
                continue;
            }
            if (c.nacksToDie === 0) {
                c.connectedTo = undefined;
                this.clients.splice(i--, 1);
                this.droppedConnections += 1;
                continue;
            }
            if (c.connectedTo === undefined) {
                c.life += 1 / Defaults.frameRate;
                if (remaining <= 0 || c.life > Defaults.maxClientWaitTime) {
                    this.clients.splice(i--, 1);
                    if (c === this.selectedClient) {
                        this.selectedClient = undefined;
                    }
                    this.failedConnections += 1;
                    this.popularityTracker.updatePopularity(-10, c.x, c.y);
                }
            }
            else {
                if (c.messagesToSend > 0 && (elapsedTime - c.lastMessageTime) > 1 / Defaults.clientsSpeed) {
                    c.sendMessage(elapsedTime);
                }
            }
        }
    }
    updateAttackers() {
        const elapsedTime = this.elapsedTime;
        for (let i = 0; i < this.attackers.length; i += 1) {
            var a = this.attackers[i];
            if (a.messagesToReceive === 0) {
                this.attackers.splice(i--, 1);
                continue;
            }
            if (a.messagesToSend != 0 && elapsedTime - a.lastMessageTime > 0.5 / Defaults.clientsSpeed) {
                a.sendMessage(elapsedTime);
            }
        }
    }
}
class Scheduler {
    popularityTracker;
    fader;
    orchestrator;
    canvas;
    game;
    timeLastDDoS = 0;
    minClientMessages = 25;
    maxClientMessages = 35;
    attackersMessages = 30;
    attackersNumber = 1;
    spawnRate = 6;
    attackRate = 80;
    timeLastClient = 1 - this.spawnRate;
    constructor(popularityTracker, fader, orchestrator, canvas, game) {
        this.popularityTracker = popularityTracker;
        this.fader = fader;
        this.orchestrator = orchestrator;
        this.canvas = canvas;
        this.game = game;
    }
    schedule() {
        const popularity = this.popularityTracker.popularity, elapsedTime = this.game.elapsedTime;
        var remaining = Defaults.gameLength * 60 - elapsedTime;
        if (remaining > Defaults.maxClientWaitTime) {
            if (elapsedTime - this.timeLastClient > Math.max(this.spawnRate - Math.cbrt(popularity / 40), 1.6) && Math.random() > 0.3) {
                this.createClient();
            }
        }
        if (remaining > 30) {
            if (elapsedTime - this.timeLastDDoS > Math.max(this.attackRate - popularity / 100, 60) && Math.random() > 0.3) {
                this.initiateDDoS();
            }
        }
    }
    reset() {
        this.timeLastDDoS = 0;
        this.timeLastClient = 1 - this.spawnRate;
    }
    createServer(zone) {
        const width = this.canvas.width, height = this.canvas.height, serverSize = Defaults.serverSize;
        let x, y, minX, minY, maxX, maxY;
        switch (zone) {
            case "nw":
                minX = serverSize;
                minY = serverSize;
                maxX = width / 3;
                maxY = height / 3;
                break;
            case "n":
                minX = width / 3;
                minY = serverSize;
                maxX = width * 2 / 3;
                maxY = height / 3;
                break;
            case "ne":
                minX = width * 2 / 3;
                minY = serverSize;
                maxX = width - serverSize;
                maxY = height / 3;
                break;
            case "w":
                minX = serverSize;
                minY = height / 3;
                maxX = width / 3;
                maxY = height * 2 / 3;
                break;
            case "c":
                minX = width / 3;
                minY = height / 3;
                maxX = width * 2 / 3;
                maxY = height * 2 / 3;
                break;
            case "e":
                minX = width * 2 / 3;
                minY = height / 3;
                maxX = width - serverSize;
                maxY = height * 2 / 3;
                break;
            case "sw":
                minX = serverSize;
                minY = height * 2 / 3;
                maxX = width / 3;
                maxY = height - serverSize;
                break;
            case "s":
                minX = width / 3;
                minY = height * 2 / 3;
                maxX = width * 2 / 3;
                maxY = height - serverSize;
                break;
            case "se":
                minX = width * 2 / 3;
                minY = height * 2 / 3;
                maxX = width - serverSize;
                maxY = height - serverSize;
                break;
            default:
                throw `Invalid zone: ${zone}.`;
        }
        x = Math.floor(Math.random() * (maxX - minX) + minX);
        y = Math.floor(Math.random() * (maxY - minY) + minY);
        while (this.checkCollisions(x, y)) {
            x = Math.floor(Math.random() * (maxX - minX) + minX);
            y = Math.floor(Math.random() * (maxY - minY) + minY);
        }
        this.game.servers.push(new Server(x, y));
    }
    ;
    createClient() {
        const width = this.canvas.width, height = this.canvas.height, elapsedTime = this.game.elapsedTime, clientSize = Defaults.clientSize;
        let x, y, msgNr;
        x = Math.floor(Math.random() * (width - 2 * clientSize) + clientSize);
        y = Math.floor(Math.random() * (height - 2 * clientSize) + clientSize);
        while (this.checkCollisions(x, y)) {
            x = Math.floor(Math.random() * (width - 2 * clientSize) + clientSize);
            y = Math.floor(Math.random() * (height - 2 * clientSize) + clientSize);
        }
        msgNr = Math.floor(Math.random() * (this.maxClientMessages - this.minClientMessages)) +
            this.minClientMessages + Math.floor(this.popularityTracker.popularity / 100);
        this.game.clients.push(new Client(this.orchestrator, this.popularityTracker, x, y, msgNr));
        this.fader.createQueue(x.toString() + y.toString(), x, y - 8 - clientSize / 2);
        this.timeLastClient = elapsedTime;
    }
    ;
    initiateDDoS() {
        const width = this.canvas.width, height = this.canvas.height, elapsedTime = this.game.elapsedTime, clientSize = Defaults.clientSize;
        var i, x, y, a, mod = Math.floor(this.popularityTracker.popularity / 400), n = this.attackersNumber + mod;
        for (i = 0; i < n; i += 1) {
            x = Math.floor(Math.random() * (width - 2 * clientSize) + clientSize);
            y = Math.floor(Math.random() * (height - 2 * clientSize) + clientSize);
            while (this.checkCollisions(x, y)) {
                x = Math.floor(Math.random() * (width - 2 * clientSize) + clientSize);
                y = Math.floor(Math.random() * (height - 2 * clientSize) + clientSize);
            }
            const server = this.findClosestServer(x, y);
            if (server) {
                a = new Attacker(this.orchestrator, x, y, this.attackersMessages + mod, server);
                this.game.attackers.push(a);
            }
        }
        this.timeLastDDoS = elapsedTime;
    }
    ;
    checkCollisions(x, y) {
        const serverSize = Defaults.serverSize, clientSize = Defaults.clientSize, servers = this.game.servers, clients = this.game.clients, attackers = this.game.attackers;
        for (let i = 0; i < servers.length; i += 1) {
            const s = servers[i];
            if (Math.abs(x - s.x) < serverSize && Math.abs(y - s.y) < 2 * serverSize) {
                return true;
            }
        }
        for (let i = 0; i < clients.length; i += 1) {
            const c = clients[i];
            if (Math.abs(x - c.x) < clientSize && Math.abs(y - c.y) < clientSize) {
                return true;
            }
        }
        for (let i = 0; i < attackers.length; i += 1) {
            const a = attackers[i];
            if (Math.abs(x - a.x) < clientSize && Math.abs(y - a.y) < clientSize) {
                return true;
            }
        }
    }
    findClosestServer(x, y) {
        let closest, currentDistance = this.canvas.width;
        this.game.servers.forEach((server) => {
            const newDistance = Utilities.getDistance(x, y, server.x, server.y);
            if (newDistance < currentDistance) {
                currentDistance = newDistance;
                closest = server;
            }
        });
        return closest;
    }
}
class NewGame {
    orchestrator;
    upgrades;
    popularity;
    game;
    scheduler;
    fader;
    constructor(orchestrator, upgrades, popularity, game, scheduler, fader) {
        this.orchestrator = orchestrator;
        this.upgrades = upgrades;
        this.popularity = popularity;
        this.game = game;
        this.scheduler = scheduler;
        this.fader = fader;
    }
    execute() {
        this.orchestrator.reset();
        this.upgrades.reset();
        this.popularity.reset();
        this.game.reset();
        this.scheduler.reset();
        this.fader.emptyQueues();
    }
}
class Utilities {
    static drawLine(x1, y1, x2, y2, c, w, context) {
        if (!w) {
            w = 1;
        }
        context.strokeStyle = c;
        context.lineWidth = w;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }
    static drawRectBorder(x, y, w, h, c, bw, context) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (!bw) {
            bw = 1;
        }
        context.strokeStyle = c;
        context.lineWidth = bw;
        context.strokeRect(x - w / 2 - bw / 2, y - h / 2 - bw / 2, w + bw, h + bw);
    }
    static drawRect(x, y, w, h, c, bc, bw, context) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (bc) {
            Utilities.drawRectBorder(x, y, w, h, bc, bw, context);
        }
        context.fillStyle = c;
        context.beginPath();
        context.rect(x - w / 2, y - h / 2, w, h);
        context.closePath();
        context.fill();
    }
    static drawSky(canvas, $clouds) {
        const context = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
        Utilities.drawRect(w / 2, h / 2, w, h, '#0360AE', '', 0, context);
        $clouds.draw(context);
    }
    static drawText(x, y, text, font, align, baseline, color, context) {
        context.font = font;
        context.textAlign = align;
        context.textBaseline = baseline;
        context.fillStyle = color;
        context.fillText(text, x, y);
    }
    static getDistance(x1, y1, x2, y2) {
        var xs = x2 - x1, ys = y2 - y1;
        return Math.sqrt(Math.pow(xs, 2) + Math.pow(ys, 2));
    }
    static invertColor(color) {
        color = color.substring(1);
        let colorNumber = parseInt(color, 16);
        colorNumber = 0xFFFFFF ^ colorNumber;
        color = colorNumber.toString(16);
        color = ('000000' + color).slice(-6);
        color = '#' + color;
        return color;
    }
}
class Credits {
    canvas;
    $clouds;
    buttons;
    constructor(canvas, $clouds, game) {
        this.canvas = canvas;
        this.$clouds = $clouds;
        const w = canvas.width, h = canvas.height;
        this.buttons = [new Button(w / 2, h - 60, 120, 40, "Back", "#FFFFFF", () => {
                game.switchMode(Defaults.gameModes.MENU);
            })];
    }
    getButtons() {
        return this.buttons;
    }
    update() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        context.clearRect(0, 0, w, h);
        Utilities.drawSky(this.canvas, this.$clouds);
        this.drawCredits(128, 'An idea by:', 'Treestle', '(treestle.com)');
        this.drawCredits(258, 'Designed and developed by:', 'Naccio', '(naccio.net)');
        this.drawCredits(388, 'Music by:', 'Macspider', '(soundcloud.com/macspider)');
    }
    drawCredits(y, heading, text, subText) {
        this.drawRect(y);
        this.drawHeading(y - 28, heading);
        this.drawMainText(y, text);
        this.drawSubText(y + 28, subText);
    }
    drawRect(y) {
        const context = this.canvas.getContext('2d'), w = this.canvas.width;
        Utilities.drawRect(w / 2, y, w, 100, 'rgba(0,0,0,0.1)', 'rgba(200,200,200,0.5)', 0, context);
    }
    drawHeading(y, text) {
        this.drawText(y, text, 'bold 20px monospace', 'red');
    }
    drawMainText(y, text) {
        this.drawText(y, text, '30px monospace', 'white');
    }
    drawSubText(y, text) {
        this.drawText(y, text, '15px monospace', '#ddd');
    }
    drawText(y, text, font, color) {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, align = "center", baseline = "middle";
        Utilities.drawText(w / 2, y, text, font, align, baseline, color, context);
    }
}
class Defaults {
    static clientSize = 30;
    static clientsSpeed = 2;
    static defaultColor = 'black';
    static frameRate = 60;
    static gameLength = 5;
    static maxClientWaitTime = 9;
    static messageVelocity = 200;
    static serversCapacity = 80;
    static serverSize = 40;
    static serversSpeed = 3.5;
    static gameModes = { MENU: 0, GAME: 1, GAMEOVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
}
class GameOver {
    canvas;
    $clouds;
    game;
    orchestrator;
    popularity;
    baseline = 'middle';
    color = 'white';
    buttons;
    constructor(canvas, $clouds, game, orchestrator, popularity, newGame) {
        this.canvas = canvas;
        this.$clouds = $clouds;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularity = popularity;
        const w = canvas.width, h = canvas.height;
        this.buttons = [
            new Button(w / 2, h - 110, 120, 40, 'Restart', '#FFFFFF', () => newGame.execute()),
            new Button(w / 2, h - 60, 120, 40, 'Menu', '#FFFFFF', () => game.switchMode(Defaults.gameModes.MENU))
        ];
    }
    getButtons() {
        return this.buttons;
    }
    update() {
        var context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        context.clearRect(0, 0, w, h);
        Utilities.drawSky(this.canvas, this.$clouds);
        Utilities.drawText(w / 2, 100, 'Game Over', 'small-caps 60px monospace', 'center', this.baseline, 'red', context);
        this.drawStat(h / 2 - 80, 'Succesful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);
        const font = '30px monospace';
        Utilities.drawText(w / 2 + 68, h / 2 + 50, 'Popularity:', font, 'end', this.baseline, this.color, context);
        Utilities.drawText(w / 2 + 75, h / 2 + 50, this.popularity.popularity.toString(), font, 'start', this.baseline, this.color, context);
        Utilities.drawLine(w / 2 - 130, h / 2 + 20, w / 2 + 130, h / 2 + 20, 'red', 1, context);
    }
    drawStat(y, text, value) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }
    drawStatTitle(y, text) {
        const context = this.canvas.getContext('2d'), x = this.canvas.width / 2 + 80;
        Utilities.drawText(x, y, text + ':', '15px monospace', 'end', this.baseline, this.color, context);
    }
    drawStatValue(y, value) {
        const context = this.canvas.getContext('2d'), x = this.canvas.width / 2 + 90;
        Utilities.drawText(x, y, value.toString(), '15px monospace', 'start', this.baseline, this.color, context);
    }
}
class Menu {
    canvas;
    $clouds;
    buttons;
    constructor(canvas, $clouds, game, ui, Tutorial, newGame) {
        this.canvas = canvas;
        this.$clouds = $clouds;
        const w = canvas.width, h = canvas.height;
        this.buttons = [
            new Button(w / 2, h / 2, 120, 40, 'Tutorial', '#FFFFFF', () => Tutorial.initialize()),
            new Button(w / 2, h / 2 + 60, 120, 40, 'New Game', '#FFFFFF', () => newGame.execute()),
            new Button(w / 2, h / 2 + 120, 120, 40, 'Credits', '#FFFFFF', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ui.volumeButton
        ];
    }
    getButtons() {
        return this.buttons;
    }
    update() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, align = "center", baseline = "middle", color = "rgba(255,255,255,0.6)";
        context.clearRect(0, 0, w, h);
        Utilities.drawSky(this.canvas, this.$clouds);
        Utilities.drawRect(w / 2, 140, w, 180, 'rgba(0,0,0,0.1)', 'rgba(200,200,200,0.5)', 0, context);
        Utilities.drawText(w / 2, 110, 'Load Balancing', 'small-caps bold 110px monospace', align, baseline, color, context);
        Utilities.drawText(w / 2, 185, 'The Game', '45px monospace', align, baseline, color, context);
        Utilities.drawLine(120, 160, w - 118, 160, 'red', 2, context);
    }
}
class BorderButton {
    x;
    y;
    width;
    height;
    text;
    color;
    hoverColor;
    borderWidth;
    onClick;
    constructor(x, y, width, height, text, color, hoverColor, borderWidth, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.hoverColor = hoverColor;
        this.borderWidth = borderWidth;
        this.onClick = onClick;
    }
    draw(hovered, context) {
        let color;
        if (!hovered) {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.color, this.borderWidth, context);
            color = this.color;
        }
        else {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.hoverColor, this.borderWidth, context);
            color = this.hoverColor;
        }
        Utilities.drawText(this.x, this.y, this.text, '15px monospace', 'center', 'middle', color, context);
    }
}
class CursorTracker {
    game;
    canvas;
    ui;
    mouseX = 0;
    mouseY = 0;
    constructor(game, canvas, ui) {
        this.game = game;
        this.canvas = canvas;
        this.ui = ui;
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
    clickHandler(event) {
        const canvas = this.canvas, x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop;
        this.ui.click(x, y);
    }
    cursorPositionHandler(x, y) {
        const game = this.game, gameModes = Defaults.gameModes, clientSize = Defaults.clientSize, serverSize = Defaults.serverSize;
        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {
            if (game.selectedClient !== undefined) {
                game.servers.forEach(function (server) {
                    if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
                        y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
                        game.selectedClient.connectedTo = server;
                    }
                });
            }
            game.selectedClient = undefined;
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
    mouseDownHandler(event) {
        const canvas = this.canvas, x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop;
        this.cursorPositionHandler(x, y);
    }
    mouseUpHandler(event) {
        const game = this.game, canvas = this.canvas, gameModes = Defaults.gameModes, serverSize = Defaults.serverSize;
        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {
            const x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop;
            if (game.selectedClient !== undefined) {
                game.servers.forEach(function (server) {
                    if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
                        y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
                        game.selectedClient.connectedTo = server;
                        game.selectedClient = undefined;
                    }
                });
            }
        }
    }
    touchHandler(event) {
        const game = this.game, canvas = this.canvas, touch = event.targetTouches[0], x = touch.pageX - canvas.offsetLeft, y = touch.pageY - canvas.offsetTop;
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
                const mouseX = this.mouseX, mouseY = this.mouseY, serverSize = Defaults.serverSize, clientSize = Defaults.clientSize;
                game.servers.forEach(function (server) {
                    if (mouseX > server.x - serverSize / 2 - 5 && mouseX < server.x + serverSize / 2 + 5
                        && mouseY > server.y - serverSize / 2 - 5 && mouseY < server.y + serverSize / 2 + 5) {
                        game.selectedClient.connectedTo = server;
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
class FpsCounter {
    lastTimestamp = Date.now();
    fps = 0;
    update() {
        const currentTimestamp = Date.now(), diff = (currentTimestamp - this.lastTimestamp) / 1000;
        this.fps = Math.floor(1 / diff);
        this.lastTimestamp = currentTimestamp;
    }
    ;
    logFps() {
        let l = document.getElementById("fps");
        if (!l) {
            const log = document.getElementById("log");
            if (log) {
                log.innerHTML = 'Fps: <span id="fps"></span><br />' + log.innerHTML;
            }
            l = document.getElementById("fps");
        }
        l.innerHTML = this.fps.toString();
    }
    ;
}
class SpecialButton extends Button {
    hoverColor;
    borderWidth;
    specialDraw;
    constructor(x, y, width, height, color, hoverColor, borderWidth, onClick, specialDraw) {
        super(x, y, width, height, '', color, onClick);
        this.hoverColor = hoverColor;
        this.borderWidth = borderWidth;
        this.specialDraw = specialDraw;
    }
    draw(hovered, context) {
        Utilities.drawRect(this.x, this.y, this.width, this.height, this.color, '', 0, context);
        if (hovered) {
            Utilities.drawRectBorder(this.x, this.y, this.width, this.height, this.hoverColor, this.borderWidth, context);
        }
        this.specialDraw(hovered);
    }
    ;
}
