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
    totalACKs = 0;
    avgResponseTime = 0;
    createMessage(sender, receiver) {
        const m = new Message(sender, receiver);
        m.computeVelocity();
        this.messages.push(m);
    }
    registerAck(message) {
        this.totalACKs += 1;
        this.avgResponseTime = (message.life + (this.totalACKs - 1) * this.avgResponseTime) / this.totalACKs;
    }
    reset() {
        this.messages = [];
        this.totalACKs = 0;
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
    messages;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    messagesToReceive;
    constructor(orchestrator, x, y, messages, connectedTo) {
        this.orchestrator = orchestrator;
        this.x = x;
        this.y = y;
        this.messages = messages;
        this.connectedTo = connectedTo;
        this.x = x;
        this.y = y;
        this.connectedTo = connectedTo;
        this.lastMessageTime = 0;
        this.messagesToSend = messages;
        this.messagesToReceive = messages;
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
        Utilities.drawText({
            x,
            y: y - delta,
            text: text.text,
            font: text.font,
            align: 'center',
            color
        }, this.context);
    }
}
class Utilities {
    static drawCircle(circle, context) {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
        context.closePath();
        if (circle.color) {
            context.fillStyle = circle.color;
            context.fill();
        }
        if (circle.borderColor && circle.borderWidth) {
            context.strokeStyle = circle.borderColor;
            context.lineWidth = circle.borderWidth;
            context.stroke();
        }
    }
    static drawCircleHighlight(x, y, radius, context) {
        const innerCircle = {
            x,
            y,
            radius,
            borderColor: 'fireBrick',
            borderWidth: 2
        }, outerCircle = {
            ...innerCircle,
            radius: radius + 1,
            borderColor: 'red'
        };
        Utilities.drawCircle(innerCircle, context);
        Utilities.drawCircle(outerCircle, context);
    }
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
    static drawStar(cx, cy, spikes, outerRadius, innerRadius, c, bc, bw, context) {
        let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / spikes;
        context.beginPath();
        context.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i += 1) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }
        context.lineTo(cx, cy - outerRadius);
        context.closePath();
        if (bc && bw) {
            context.lineWidth = bw;
            context.strokeStyle = bc;
            context.stroke();
        }
        context.fillStyle = c;
        context.fill();
    }
    static drawText(text, context) {
        context.font = text.font;
        context.textAlign = text.align ?? 'start';
        context.textBaseline = text.baseline ?? 'middle';
        context.fillStyle = text.color ?? Defaults.defaultColor;
        context.fillText(text.text, text.x, text.y);
    }
    static drawTriangle(x, y, b, h, c, bc, bw, context) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (bc) {
            Utilities.drawTriangleBorder(x, y, b, h, bc, bw, context);
        }
        var path = new Path2D();
        path.moveTo(x, y - h / 2);
        path.lineTo(x + b / 2, y + h / 2);
        path.lineTo(x - b / 2, y + h / 2);
        context.fillStyle = c;
        context.fill(path);
    }
    static drawTriangleBorder(x, y, b, h, c, bw, context) {
        if (!c) {
            c = Defaults.defaultColor;
        }
        if (!bw) {
            bw = 1;
        }
        var path = new Path2D();
        path.moveTo(x, y - h / 2);
        path.lineTo(x + b / 2, y + h / 2);
        path.lineTo(x - b / 2, y + h / 2);
        path.closePath();
        context.strokeStyle = c;
        context.lineWidth = bw;
        context.stroke(path);
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
    canvas;
    popularity;
    constructor(fader, upgrades, canvas) {
        this.fader = fader;
        this.upgrades = upgrades;
        this.canvas = canvas;
        this.popularity = 0;
    }
    draw(y) {
        const context = this.canvas.getContext('2d');
        Utilities.drawText({
            x: 10,
            y,
            text: "Popularity: " + this.popularity,
            font: '18px sans-serif'
        }, context);
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
    messages;
    life;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    ACKsToReceive;
    NACKsToDie;
    constructor(orchestrator, popularity, x, y, messages) {
        this.orchestrator = orchestrator;
        this.popularity = popularity;
        this.x = x;
        this.y = y;
        this.messages = messages;
        this.x = x;
        this.y = y;
        this.life = 0;
        this.lastMessageTime = 0;
        this.messagesToSend = messages;
        this.ACKsToReceive = messages;
        this.NACKsToDie = Math.floor(messages / 3);
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
            this.ACKsToReceive -= 1;
            n = 1;
            if (this.ACKsToReceive === 0) {
                n += 5;
            }
            this.orchestrator.registerAck(message);
            this.popularity.updatePopularity(n, this.x, this.y);
        }
        else {
            this.NACKsToDie -= 1;
            n = -1;
            if (this.NACKsToDie > 0) {
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
        Utilities.drawText({
            x: this.x,
            y: this.y,
            text: this.text,
            font: '15px monospace',
            align: 'center',
            color
        }, context);
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
                Utilities.drawText({
                    x,
                    y: y + w / 2 + 2,
                    text: 'Music: ' + status,
                    font: '10px monospace',
                    align: 'center',
                    baseline: 'top',
                    color: '#fff'
                }, context);
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
                c.ACKsToReceive -= c.messagesToSend;
                c.messagesToSend = 0;
            }
            if (c.messagesToSend === 0 && c.ACKsToReceive === 0) {
                this.clients.splice(i--, 1);
                this.clientsServed += 1;
                continue;
            }
            if (c.NACKsToDie === 0) {
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
class Credits {
    canvas;
    clouds;
    buttons;
    id = Defaults.gameModes.CREDITS;
    constructor(canvas, clouds, game) {
        this.canvas = canvas;
        this.clouds = clouds;
        const w = canvas.width, h = canvas.height;
        this.buttons = [new Button(w / 2, h - 60, 120, 40, "Back", "#FFFFFF", () => {
                game.switchMode(Defaults.gameModes.MENU);
            })];
    }
    getButtons() {
        return this.buttons;
    }
    update() {
        this.clouds.draw();
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
        const context = this.canvas.getContext('2d'), w = this.canvas.width;
        Utilities.drawText({
            x: w / 2,
            y,
            text,
            font,
            align: 'center',
            color
        }, context);
    }
}
class Defaults {
    static clientSize = 30;
    static clientsSpeed = 2;
    static defaultColor = 'black';
    static frameRate = 60;
    static gameLength = 5;
    static maxClientWaitTime = 9;
    static messageSize = 6;
    static messageVelocity = 200;
    static serversCapacity = 80;
    static serverSize = 40;
    static serversSpeed = 3.5;
    static gameModes = { MENU: 0, GAME: 1, GAME_OVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
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
class GameArea {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    upgradesTracker;
    cursor;
    fader;
    constructor(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader) {
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.upgradesTracker = upgradesTracker;
        this.cursor = cursor;
        this.fader = fader;
    }
    draw() {
        const context = this.canvas.getContext('2d'), sc = this.game.selectedClient;
        if (sc !== undefined) {
            Utilities.drawLine(sc.x, sc.y, this.cursor.mouseX, this.cursor.mouseY, 'lightBlue', 3, context);
            Utilities.drawCircle({
                x: sc.x,
                y: sc.y,
                radius: Defaults.clientSize / 2 + 3,
                color: 'lightBlue'
            }, context);
        }
        this.drawConnections();
        this.drawMessages();
        this.drawClients();
        this.drawAttackers();
        this.drawServers();
        this.drawUI();
    }
    drawAttackers() {
        this.game.attackers.forEach(a => this.drawAttacker(a));
    }
    drawClients() {
        this.game.clients.forEach(c => this.drawClient(c));
    }
    drawConnections() {
        this.game.clients.forEach(c => this.drawConnection(c, 'darkGray'));
        this.game.attackers.forEach(a => this.drawConnection(a, 'dimGray'));
    }
    drawMessages() {
        this.orchestrator.messages.forEach(m => this.drawMessage(m));
    }
    drawServers() {
        this.game.servers.forEach(s => this.drawServer(s));
    }
    drawUI() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        this.fader.draw();
        this.popularityTracker.draw(h - 14);
        Utilities.drawText({
            x: w / 2,
            y: h - 14,
            text: 'Press space to pause',
            font: '18px sans-serif',
            align: 'center',
            baseline: 'alphabetic',
            color: 'darkGray'
        }, context);
        if (this.upgradesTracker.upgradesAvailable > 0) {
            const text = {
                x: w / 2,
                y: h - 35,
                fontSize: 20,
                fontWeight: '',
                font: '20px sans-serif',
                color: { r: 255, g: 0, b: 0 },
                id: 'upgrade',
                text: '- Upgrade available! -',
                life: 400,
                alpha: 0,
                delta: 0
            };
            this.fader.addPermanentText(text);
        }
        const remaining = Math.max(0, Defaults.gameLength * 60 - this.game.elapsedTime), m = Math.floor(remaining / 60), s = Math.floor(remaining - m * 60);
        let text = '';
        if (m < 10) {
            text += '0';
        }
        text += m + ':';
        if (s < 10) {
            text += '0';
        }
        text += s;
        let color = 'darkGray';
        if (remaining <= 30) {
            color = 'tomato';
        }
        if (remaining <= 10) {
            color = 'red';
        }
        Utilities.drawText({
            x: w - 10,
            y: h - 14,
            text,
            font: '18px sans-serif',
            align: 'end',
            baseline: 'alphabetic', color
        }, context);
    }
    drawAttacker(attacker) {
        const context = this.canvas.getContext('2d'), size = Defaults.clientSize, x = attacker.x, y = attacker.y;
        Utilities.drawTriangle(x, y, size * 2 / Math.sqrt(3), size, '#333333', 'black', 2, context);
        Utilities.drawText({
            x,
            y: y + 5,
            text: 'DoS',
            font: 'bold 10px Arial',
            align: 'center',
            color: 'white'
        }, context);
    }
    drawClient(client) {
        const context = this.canvas.getContext('2d'), clientSize = Defaults.clientSize, maxClientWaitTime = Defaults.maxClientWaitTime, x = client.x, y = client.y, circle = {
            x,
            y,
            radius: clientSize / 2,
            color: 'gray',
            borderColor: 'dimGray',
            borderWidth: 1
        };
        if (client.connectedTo === undefined) {
            if (client.connectedTo === undefined && client.life > maxClientWaitTime - 2) {
                Utilities.drawCircle({ ...circle, color: 'red', borderColor: 'fireBrick' }, context);
            }
            else if (client.connectedTo === undefined && client.life > maxClientWaitTime - 3.5) {
                Utilities.drawCircle({ ...circle, color: 'tomato', borderColor: 'indianRed' }, context);
            }
            else {
                Utilities.drawCircle(circle, context);
            }
            Utilities.drawText({
                x,
                y,
                text: Math.round(maxClientWaitTime - client.life).toString(),
                font: 'bold 15px Arial',
                align: 'center',
                color: 'white'
            }, context);
        }
        else {
            Utilities.drawCircle(circle, context);
        }
    }
    drawConnection(t, color) {
        if (t.connectedTo) {
            const context = this.canvas.getContext('2d');
            Utilities.drawLine(t.x, t.y, t.connectedTo.x, t.connectedTo.y, color, 1, context);
        }
    }
    drawMessage(message) {
        const context = this.canvas.getContext('2d');
        let fill, border;
        switch (message.status) {
            case 'queued':
            case 'done':
                return;
            case 'req':
                fill = "lightBlue";
                border = "steelBlue";
                break;
            case 'ack':
                fill = "lime";
                border = "limeGreen";
                break;
            case 'nack':
                fill = "tomato";
                border = "indianRed";
                break;
            default:
                throw 'Invalid message status: ' + message.status;
        }
        Utilities.drawCircle({
            x: message.x,
            y: message.y,
            radius: Defaults.messageSize / 2,
            color: fill,
            borderColor: border,
            borderWidth: 1
        }, context);
    }
    drawServer(server) {
        const context = this.canvas.getContext('2d'), serverSize = Defaults.serverSize;
        let i = Math.max(0, server.capacity / Defaults.serversCapacity - 1);
        for (; i > -1; i -= 1) {
            const fill = `rgb(0,${128 - 15 * i},0)`, border = `rgb(0,${100 - 15 * i},0)`;
            Utilities.drawRect(server.x + 3 * i, server.y - 3 * i, serverSize, serverSize, fill, border, 1, context);
        }
        const serversSpeed = Defaults.serversSpeed, queueWidth = 5, queueHeight = serverSize - 10, queueX = server.x + serverSize / 2 - 7, queueY = server.y + 1, fillPercentage = (server.queue.length / server.capacity) * 100, gradientWidth = 5, gradientHeight = fillPercentage * queueHeight / 100, gradientX = queueX, gradientY = queueY + queueHeight / 2 - gradientHeight / 2;
        Utilities.drawRectBorder(queueX, queueY, queueWidth, queueHeight, '#004500', 1, context);
        const gradient = context.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, 'limeGreen');
        gradient.addColorStop(1, 'red');
        Utilities.drawRect(gradientX, gradientY, gradientWidth, gradientHeight, gradient, '', 0, context);
        for (i = server.speed; i > 0; i -= serversSpeed) {
            const starX = server.x - serverSize / 2 + 7, starY = server.y + serverSize / 2 - 4 - 5 * (i / serversSpeed);
            Utilities.drawStar(starX, starY, 5, 4, 2, 'limeGreen', '#004500', 2, context);
        }
    }
}
class Game {
    canvas;
    game;
    scheduler;
    orchestrator;
    gameArea;
    fader;
    id = Defaults.gameModes.GAME;
    constructor(canvas, game, scheduler, orchestrator, gameArea, fader) {
        this.canvas = canvas;
        this.game = game;
        this.scheduler = scheduler;
        this.orchestrator = orchestrator;
        this.gameArea = gameArea;
        this.fader = fader;
    }
    getButtons() {
        return [];
    }
    update() {
        if (this.game.servers.length === 0) {
            this.scheduler.createServer('c');
        }
        this.orchestrator.updateMessages();
        this.game.update();
        this.fader.update(1 / Defaults.frameRate);
        this.scheduler.schedule();
        var m = Math.floor(this.game.elapsedTime / 60);
        if (m === Defaults.gameLength && this.game.clients.length === 0) {
            this.game.switchMode(Defaults.gameModes.GAME_OVER);
            return;
        }
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        context.clearRect(0, 0, w, h);
        this.gameArea.draw();
    }
}
class GameOver {
    canvas;
    clouds;
    game;
    orchestrator;
    popularity;
    color = 'white';
    buttons;
    id = Defaults.gameModes.GAME_OVER;
    constructor(canvas, clouds, game, orchestrator, popularity, newGame) {
        this.canvas = canvas;
        this.clouds = clouds;
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
        this.clouds.draw();
        Utilities.drawText({
            x: w / 2,
            y: 100,
            text: 'Game Over',
            font: 'small-caps 60px monospace',
            align: 'center',
            color: 'red'
        }, context);
        this.drawStat(h / 2 - 80, 'Successful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);
        const font = '30px monospace';
        Utilities.drawText({
            x: w / 2 + 68,
            y: h / 2 + 50,
            text: 'Popularity:',
            font,
            align: 'end',
            color: this.color
        }, context);
        Utilities.drawText({
            x: w / 2 + 75,
            y: h / 2 + 50,
            text: this.popularity.popularity.toString(),
            font,
            align: 'start',
            color: this.color
        }, context);
        Utilities.drawLine(w / 2 - 130, h / 2 + 20, w / 2 + 130, h / 2 + 20, 'red', 1, context);
    }
    drawStat(y, text, value) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }
    drawStatTitle(y, text) {
        const context = this.canvas.getContext('2d'), x = this.canvas.width / 2 + 80;
        Utilities.drawText({
            x,
            y,
            text: text + ':',
            font: '15px monospace',
            align: 'end',
            color: this.color
        }, context);
    }
    drawStatValue(y, value) {
        const context = this.canvas.getContext('2d'), x = this.canvas.width / 2 + 90;
        Utilities.drawText({
            x,
            y,
            text: value.toString(),
            font: '15px monospace',
            align: 'start',
            color: this.color
        }, context);
    }
}
class TutorialStep {
    id;
    texts;
    hasNext = false;
    hasHome = false;
    advance = false;
    advanceOnSpace = false;
    extraButtons = [];
    constructor(id, texts) {
        this.id = id;
        this.texts = texts;
    }
    setup() { }
    run() { }
    draw() { }
}
class Tutorial {
    steps;
    canvas;
    gameArea;
    fader;
    game;
    orchestrator;
    nextButton;
    homeButton;
    currentStep;
    id = Defaults.gameModes.TUTORIAL;
    constructor(steps, canvas, gameArea, fader, game, orchestrator) {
        this.steps = steps;
        this.canvas = canvas;
        this.gameArea = gameArea;
        this.fader = fader;
        this.game = game;
        this.orchestrator = orchestrator;
        const w = canvas.width, h = canvas.height;
        this.currentStep = steps[0];
        this.nextButton = new Button(w / 3, h - 40, 120, 40, 'Next', '#FFFFFF', () => this.advance());
        this.homeButton = new Button(w * 2 / 3, h - 40, 120, 40, "Exit tutorial", "#FFFFFF", () => game.switchMode(Defaults.gameModes.MENU));
        this.currentStep.setup();
        document.addEventListener('keypress', e => this.listener(e));
    }
    getButtons() {
        const buttons = [...this.currentStep.extraButtons];
        if (this.currentStep.hasNext) {
            buttons.push(this.nextButton);
        }
        if (this.currentStep.hasHome) {
            buttons.push(this.homeButton);
        }
        return buttons;
    }
    update() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, texts = this.currentStep.texts;
        this.currentStep.run();
        this.fader.update(1 / Defaults.frameRate);
        if (this.currentStep.advance) {
            this.advance();
        }
        context.clearRect(0, 0, w, h);
        this.gameArea.draw();
        this.fader.draw();
        Utilities.drawRect(w / 2, 40, w, 80, '#0360AE', '#02467F', 1, context);
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            Utilities.drawText({
                x: w / 2,
                y: 18 + 20 * i,
                text,
                font: 'bold 18px monospace',
                align: 'center',
                color: 'white'
            }, context);
        }
        Utilities.drawRect(w / 2, h - 40, w, 80, '#0360AE', '#02467F', 1, context);
        this.currentStep.draw();
    }
    reset() {
        this.game.reset();
        this.orchestrator.reset();
        this.fader.emptyQueues();
        this.currentStep = this.steps[0];
        this.currentStep.setup();
        this.game.switchMode(Defaults.gameModes.TUTORIAL);
    }
    advance() {
        this.currentStep = this.steps[this.currentStep.id + 1];
        this.currentStep.setup();
    }
    listener(event) {
        if (event.key === ' ' && this.currentStep.advanceOnSpace) {
            this.advance();
        }
    }
}
class Menu {
    canvas;
    clouds;
    buttons;
    id = Defaults.gameModes.MENU;
    constructor(canvas, clouds, game, ui, tutorial, newGame) {
        this.canvas = canvas;
        this.clouds = clouds;
        const w = canvas.width, h = canvas.height;
        this.buttons = [
            new Button(w / 2, h / 2, 120, 40, 'Tutorial', '#FFFFFF', () => tutorial.reset()),
            new Button(w / 2, h / 2 + 60, 120, 40, 'New Game', '#FFFFFF', () => newGame.execute()),
            new Button(w / 2, h / 2 + 120, 120, 40, 'Credits', '#FFFFFF', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ui.volumeButton
        ];
    }
    getButtons() {
        return this.buttons;
    }
    update() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, align = "center", baseline = "middle", color = "rgba(255,255,255,0.6)";
        this.clouds.draw();
        Utilities.drawRect(w / 2, 140, w, 180, 'rgba(0,0,0,0.1)', 'rgba(200,200,200,0.5)', 0, context);
        Utilities.drawText({
            x: w / 2,
            y: 110,
            text: 'Load Balancing',
            font: 'small-caps bold 110px monospace',
            align,
            color
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: 185,
            text: 'The Game',
            font: '45px monospace',
            align,
            color
        }, context);
        Utilities.drawLine(120, 160, w - 118, 160, 'red', 2, context);
    }
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
class Pause {
    canvas;
    clouds;
    game;
    upgradesTracker;
    buttons;
    upgradeButtons;
    id = Defaults.gameModes.PAUSE;
    constructor(canvas, clouds, game, upgradesTracker, ui, newGame) {
        this.canvas = canvas;
        this.clouds = clouds;
        this.game = game;
        this.upgradesTracker = upgradesTracker;
        const context = canvas.getContext('2d'), w = canvas.width, serverSize = Defaults.serverSize;
        this.buttons = [
            new Button(w / 2, 150, 120, 40, 'Continue', '#FFFFFF', () => game.switchMode(Defaults.gameModes.GAME)),
            new Button(w / 2, 210, 120, 40, "New game", "#FFFFFF", () => newGame.execute()),
            new Button(w / 2, 270, 120, 40, "Abandon", "#FFFFFF", () => game.switchMode(Defaults.gameModes.MENU)),
            ui.volumeButton
        ];
        this.upgradeButtons = [
            this.createUpgradeButton(250, 'server', 'Buy new datacenter', (x, y) => {
                Utilities.drawText({
                    x: x - 25,
                    y,
                    text: "+",
                    font: '45px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
                Utilities.drawRect(x + 15, y, serverSize, serverSize, '#DDDDDD', 'red', 1, context);
                Utilities.drawStar(x - serverSize / 2 + 22, y + serverSize / 2 - 9, 5, 4, 2, "#BBBBBB", "#999999", 2, context);
                Utilities.drawRect(x + serverSize / 2 + 8, y + 1, 6, serverSize - 10, "#BBBBBB", "#999999", 1, context);
            }),
            this.createUpgradeButton(w / 2, 'capacity', 'Scale off at one location', (x, y) => {
                var queueX = x + serverSize / 2 - 7, queueY = y + 1, starX = x - serverSize / 2 + 7, starY = y + serverSize / 2 - 9, color = 'red', lineWidth = 3;
                Utilities.drawRect(x, y, serverSize, serverSize, "#DDDDDD", "#999999", 1, context);
                Utilities.drawRect(queueX, queueY, 6, serverSize - 10, "salmon", "red", 1, context);
                Utilities.drawStar(starX, starY, 5, 4, 2, "#BBBBBB", "#999999", 2, context);
                Utilities.drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth, context);
                Utilities.drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
                Utilities.drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            }),
            this.createUpgradeButton(w - 250, 'speed', 'Improve speed at one location', (x, y) => {
                var queueX = x + serverSize / 2 - 7, queueY = y + 1, starX = x - serverSize / 2 + 7, starY = y + serverSize / 2 - 9, color = "red", lineWidth = 3;
                Utilities.drawRect(x, y, serverSize, serverSize, "#DDDDDD", "#999999", 1, context);
                Utilities.drawRect(queueX, queueY, 6, serverSize - 10, "#BBBBBB", "#999999", 1, context);
                Utilities.drawStar(starX, starY, 5, 4, 2, "salmon", "red", 2, context);
                Utilities.drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth, context);
                Utilities.drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth, context);
                Utilities.drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth, context);
            })
        ];
    }
    getButtons() {
        return this.upgradesTracker.upgradesAvailable > 0
            ? [...this.buttons, ...this.upgradeButtons]
            : [...this.buttons];
    }
    update() {
        var context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, x = w / 2, font = "25px monospace", color;
        this.clouds.draw();
        if (this.upgradesTracker.upgradesAvailable > 0) {
            color = "black";
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: "Choose an upgrade:",
                font,
                align: 'center',
                color
            }, context);
        }
        else {
            color = "#DDDDDD";
            Utilities.drawText({
                x,
                y: h / 2 + 60,
                text: "No upgrades available",
                font,
                align: 'center',
                color
            }, context);
        }
        color = "red";
        font = "50px monospace";
        Utilities.drawText({
            x,
            y: 60,
            text: "~ Paused ~",
            font,
            align: 'center',
            color
        }, context);
    }
    createUpgradeButton(x, id, text, draw) {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, y = h / 2 + 150;
        return new SpecialButton(x, y, 100, 100, '#333333', 'white', 2, () => {
            this.upgradesTracker.selectedUpgrade = id;
            this.game.switchMode(Defaults.gameModes.UPGRADE);
        }, (hovered) => {
            draw(x, y);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text,
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        });
    }
}
class TutorialStep1 extends TutorialStep {
    canvas;
    game;
    constructor(canvas, game) {
        super(0, [
            'Welcome to Load Balancing: The Game!',
            'Here you will take the role of -you guessed it- a LOAD BALANCER.',
            'Click "Next" to start the tutorial.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, server = new Server(w / 2, h / 2);
        server.capacity = 20;
        this.game.servers.push(server);
    }
}
class TutorialStep2 extends TutorialStep {
    canvas;
    constructor(canvas) {
        super(1, [
            'This is a DATACENTER.',
            'Its role is to send data to your clients.',
            'Click "Next" to continue.'
        ]);
        this.canvas = canvas;
        this.hasNext = true;
        this.hasHome = true;
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        Utilities.drawCircleHighlight(w / 2, h / 2, Defaults.serverSize + 9, context);
    }
}
class TutorialStep3 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(2, [
            'This is a CLIENT.',
            'It wants to exchange data with your datacenter.',
            'Your job will be to connect the clients to a datacenter.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, client = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 2, 10000);
        client.life = -31;
        this.game.clients.push(client);
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        Utilities.drawCircleHighlight(w * 3 / 4, h / 2, Defaults.clientSize + 9, context);
        Utilities.drawCircle({
            x: w * 3 / 4,
            y: h / 2,
            radius: Defaults.clientSize / 2,
            color: 'gray'
        }, context);
    }
}
class TutorialStep4 extends TutorialStep {
    game;
    constructor(game) {
        super(3, [
            'To create a connection, click on the client and then on the datacenter.',
            'Be quick though! Clients don\'t like waiting!',
            'Create a CONNECTION to continue.'
        ]);
        this.game = game;
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
                'Create a CONNECTION to continue.'
            ];
            client.life = -31;
        }
        this.game.updateClients();
    }
}
class TutorialHelper {
    static drawLegend(canvas, includeNACK) {
        const context = canvas.getContext('2d'), w = canvas.width, x = w - 120, y = 100, iconRadius = 3, textSpacing = 2, lineSpacing = iconRadius + 5, font = "10px sans-serif", circle = {
            x,
            y,
            radius: iconRadius,
            borderWidth: 1
        }, text = {
            x: x + textSpacing + iconRadius,
            y,
            text: '',
            font
        };
        Utilities.drawCircle({
            ...circle,
            color: 'lightBlue',
            borderColor: 'skyBlue'
        }, context);
        Utilities.drawText({
            ...text,
            text: ': Request'
        }, context);
        Utilities.drawCircle({
            ...circle,
            y: y + lineSpacing,
            color: 'lime',
            borderColor: 'limeGreen'
        }, context);
        Utilities.drawText({
            ...text,
            y: y + lineSpacing,
            text: ': Response (+1)'
        }, context);
        if (includeNACK) {
            Utilities.drawCircle({
                ...circle,
                y: y + lineSpacing * 2,
                color: 'tomato',
                borderColor: 'indianRed'
            }, context);
            Utilities.drawText({
                ...text,
                y: y + lineSpacing * 2,
                text: ': Datacenter busy (-1)'
            }, context);
        }
    }
}
class TutorialStep5 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(4, [
            'Good job! Now your very first client is being served.',
            'You can see the REQUESTS and RESPONSES traveling along the connection.',
            'The POPULARITY measures how successful your service is being.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        this.popularityTracker.popularity = 0;
    }
    run() {
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const context = this.canvas.getContext('2d'), h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);
        Utilities.drawCircleHighlight(70, h - 95, 67, context);
    }
}
class TutorialStep6 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(5, [
            'Cool! Two new clients want to use your service!',
            'Connect them as well to start gaining some more popularity.',
            'Remember, if you wait too much, you will lose popularity!'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasHome = true;
    }
    setup() {
        this.spawnClients();
    }
    run() {
        const server = this.game.servers[0];
        if (server.queue.length > server.capacity / 2) {
            this.advance = true;
        }
        if (this.game.clients.length === 1) {
            this.texts = [
                'Oh snap! You let too much time pass!',
                'As you can see you lost 10 popularity each.',
                'Connect the two clients to continue.'
            ];
            this.spawnClients();
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);
    }
    spawnClients() {
        const w = this.canvas.width, h = this.canvas.height, client1 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 4, 10000), client2 = new Client(this.orchestrator, this.popularityTracker, w / 4, h * 3 / 4, 10000);
        client1.life = -21;
        client2.life = -21;
        this.game.clients.push(client1, client2);
    }
}
class TutorialStep7 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(6, [
            'Oh no! Looks like your datacenter can\'t handle all this traffic!',
            'Clients will not be pleased if your datacenter is too busy to reply.',
            'You can see how busy a datacenter is by looking at its status bar.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasNext = true;
        this.hasHome = true;
    }
    run() {
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, serverSize = Defaults.serverSize;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawCircleHighlight(w / 2 + serverSize / 2 - 7, h / 2 + 1, serverSize / 2, context);
    }
}
class TutorialStep8 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    fader;
    constructor(canvas, game, orchestrator, popularityTracker, fader) {
        super(7, [
            'Thankfully, you are popular enough to afford to UPGRADE your datacenter.',
            'As your popularity grows, you will be able to upgrade it even more.',
            'Press SPACE to pause the game and select an upgrade.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.fader = fader;
        this.hasHome = true;
        this.advanceOnSpace = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, text = {
            x: w / 2,
            y: h - 116,
            font: '20px sans-serif',
            fontSize: 20,
            fontWeight: '',
            color: { r: 255, g: 0, b: 0 },
            id: 'upgradeTut',
            text: '- Upgrade available! -',
            life: 1000,
            alpha: 0,
            delta: 0
        };
        this.fader.addPermanentText(text);
    }
    run() {
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawText({
            x: w / 2,
            y: h - 95,
            text: 'Press space to pause',
            font: '18px sans-serif',
            align: 'center',
            color: 'darkGray'
        }, context);
    }
}
class TutorialStep9 extends TutorialStep {
    canvas;
    game;
    fader;
    constructor(canvas, game, fader) {
        super(8, [
            'Let\'s improve your datacenter\'s speed.',
            'This way it will process the clients\' requests faster.',
            'Select the third upgrade (Improve speed at one location).'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.fader = fader;
        const context = canvas.getContext('2d'), w = canvas.width, h = canvas.height, buttons = [], serverSize = Defaults.serverSize;
        const x1 = 250, y1 = h / 2 + 150;
        buttons.push(new SpecialButton(x1, y1, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            Utilities.drawText({
                x: x1 - 25,
                y: y1,
                text: '+',
                font: '45px monospace',
                align: 'center',
                color: 'red'
            }, context);
            Utilities.drawRect(x1 + 15, y1, serverSize, serverSize, '#DDDDDD', 'red', 1, context);
            Utilities.drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Buy new datacenter',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        const x2 = w / 2, y2 = y1;
        buttons.push(new SpecialButton(x2, y2, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            const queueX = x2 + serverSize / 2 - 7, queueY = y2 + 1, starX = x2 - serverSize / 2 + 7, starY = y2 + serverSize / 2 - 9, color = 'red', lineWidth = 3;
            Utilities.drawRect(x2, y2, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, 'salmon', 'red', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth, context);
            Utilities.drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            Utilities.drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Scale off at one location',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        const x3 = w - 250, y3 = y1;
        buttons.push(new SpecialButton(x3, y3, 100, 100, '#333333', 'white', 2, () => {
            this.game.servers[0].speed += Defaults.serversSpeed;
            this.advance = true;
        }, (hovered) => {
            const queueX = x3 + serverSize / 2 - 7, queueY = y3 + 1, starX = x3 - serverSize / 2 + 7, starY = y3 + serverSize / 2 - 9, color = 'red', lineWidth = 3;
            Utilities.drawRect(x3, y3, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, 'salmon', 'red', 2, context);
            Utilities.drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth, context);
            Utilities.drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth, context);
            Utilities.drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Improve speed at one location',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        this.extraButtons = buttons;
    }
    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        Utilities.drawRect(w / 2, h / 2, w, h - 160, '#0360AE', '', 0, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 2 + 60,
            text: 'Choose an upgrade:',
            font: '25px monospace',
            align: 'center',
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 3,
            text: '~ Paused ~',
            font: '50px monospace',
            align: 'center',
            color: 'red'
        }, context);
    }
}
class TutorialStep10 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(9, [
            'Nice! You can see your datacenter\'s speed in the bottom left of it.',
            'Now the clients can finish their data exchange without any more problems.',
            'When a client is served successfully you will gain some more popularity.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasHome = true;
    }
    setup() {
        this.game.clients[0].messagesToSend = 2;
        this.game.clients[0].ACKsToReceive = 2;
        this.game.clients[1].messagesToSend = 6;
        this.game.clients[1].ACKsToReceive = 6;
        this.game.clients[2].messagesToSend = 10;
        this.game.clients[2].ACKsToReceive = 10;
        this.orchestrator.messages.forEach(function (message) {
            if (message.status === 'ack') {
                message.receiver.ACKsToReceive += 1;
            }
            if (message.status === 'queued' || message.status === 'req') {
                message.sender.ACKsToReceive += 1;
            }
        });
    }
    run() {
        if (this.game.clients.length === 0) {
            this.hasNext = true;
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height, serverSize = Defaults.serverSize;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawCircleHighlight(w / 2 - serverSize / 2 + 7, h / 2 + serverSize / 4, 15, context);
    }
}
class TutorialStep11 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    fader;
    constructor(canvas, game, orchestrator, popularityTracker, fader) {
        super(10, [
            'Oh snap! Your datacenter is under a DDOS ATTACK! And more clients need serving!',
            'This is likely to happen as you get more and more popular.',
            'You\'d better upgrade once again to cope with this situation.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.fader = fader;
        this.hasHome = true;
        this.advanceOnSpace = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, server = this.game.servers[0], attacker0 = new Attacker(this.orchestrator, w / 2, h * 3 / 4, 10000, server), attacker1 = new Attacker(this.orchestrator, w / 3, h * 2 / 3, 10000, server), attacker2 = new Attacker(this.orchestrator, w * 2 / 3, h * 2 / 3, 10000, server), text = {
            x: w / 2,
            y: h - 116,
            font: '20px sans-serif',
            fontSize: 20,
            fontWeight: '',
            color: { r: 255, g: 0, b: 0 },
            id: 'upgradeTut',
            text: '- Upgrade available! -',
            life: 1000,
            alpha: 0,
            delta: 0
        };
        this.spawnClients();
        this.game.attackers.push(attacker0, attacker1, attacker2);
        this.fader.addPermanentText(text);
    }
    run() {
        if (this.game.selectedClient) {
            this.game.selectedClient = undefined;
        }
        if (this.game.clients.length === 0) {
            this.spawnClients();
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawText({
            x: w / 2,
            y: h - 95,
            text: 'Press space to pause',
            font: '18px sans-serif',
            align: 'center',
            color: 'darkGray'
        }, context);
    }
    spawnClients() {
        const w = this.canvas.width, h = this.canvas.height, client0 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 3, 10000), client1 = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 3, 10000);
        client0.life = -21;
        client1.life = -21;
        this.game.clients.push(client0, client1);
    }
}
class TutorialStep12 extends TutorialStep {
    canvas;
    game;
    fader;
    constructor(canvas, game, fader) {
        super(11, [
            'This time let\'s buy a new datacenter.',
            'This way you can connect the clients to it while your first one is under attack.',
            'Select the first upgrade (Buy new datacenter).'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.fader = fader;
        const context = canvas.getContext('2d'), w = canvas.width, h = canvas.height, buttons = [], serverSize = Defaults.serverSize;
        const x1 = 250, y1 = h / 2 + 150;
        buttons.push(new SpecialButton(x1, y1, 100, 100, '#333333', 'white', 2, () => {
            const server = new Server(w / 2, h / 4);
            server.capacity = 20;
            this.game.servers.push(server);
            this.advance = true;
        }, (hovered) => {
            Utilities.drawText({
                x: x1 - 25,
                y: y1,
                text: '+',
                font: '45px monospace',
                align: 'center',
                color: 'red'
            }, context);
            Utilities.drawRect(x1 + 15, y1, serverSize, serverSize, '#DDDDDD', 'red', 1, context);
            Utilities.drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Buy new datacenter',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        const x2 = w / 2, y2 = y1;
        buttons.push(new SpecialButton(x2, y2, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            const queueX = x2 + serverSize / 2 - 7, queueY = y2 + 1, starX = x2 - serverSize / 2 + 7, starY = y2 + serverSize / 2 - 9, color = 'red', lineWidth = 3;
            Utilities.drawRect(x2, y2, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, 'salmon', 'red', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, '#BBBBBB', '#999999', 2, context);
            Utilities.drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth, context);
            Utilities.drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            Utilities.drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Scale off at one location',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        const x3 = w - 250, y3 = y1;
        buttons.push(new SpecialButton(x3, y3, 100, 100, '#333333', 'white', 2, () => { }, (hovered) => {
            const queueX = x3 + serverSize / 2 - 7, queueY = y3 + 1, starX = x3 - serverSize / 2 + 7, starY = y3 + serverSize / 2 - 9, color = 'red', lineWidth = 3;
            Utilities.drawRect(x3, y3, serverSize, serverSize, '#DDDDDD', '#999999', 1, context);
            Utilities.drawRect(queueX, queueY, 6, serverSize - 10, '#BBBBBB', '#999999', 1, context);
            Utilities.drawStar(starX, starY, 5, 4, 2, 'salmon', 'red', 2, context);
            Utilities.drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth, context);
            Utilities.drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth, context);
            Utilities.drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth, context);
            if (hovered) {
                Utilities.drawText({
                    x: w / 2,
                    y: h - 50,
                    text: 'Improve speed at one location',
                    font: '20px monospace',
                    align: 'center',
                    color: 'red'
                }, context);
            }
        }));
        this.extraButtons = buttons;
    }
    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }
    draw() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        Utilities.drawRect(w / 2, h / 2, w, h - 160, '#0360AE', '', 0, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 2 + 60,
            text: 'Choose an upgrade:',
            font: '25px monospace',
            align: 'center',
        }, context);
        Utilities.drawText({
            x: w / 2,
            y: h / 3,
            text: '~ Paused ~',
            font: '50px monospace',
            align: 'center',
            color: 'red'
        }, context);
    }
}
class TutorialStep13 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super(12, [
            'Perfect! Now you have a new datacenter at your disposal.',
            'This is when a good load balancing strategy will start to matter.',
            'Indeed you would be wiser to connect the clients to the new datacenter.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        this.hasHome = true;
    }
    setup() {
        this.game.clients[0].life = -21;
        this.game.clients[1].life = -21;
    }
    run() {
        if (this.game.clients.length === 0) {
            const w = this.canvas.width, h = this.canvas.height, client0 = new Client(this.orchestrator, this.popularityTracker, w / 4, h / 3, 10000), client1 = new Client(this.orchestrator, this.popularityTracker, w * 3 / 4, h / 3, 10000);
            client0.life = -21;
            client1.life = -21;
            this.game.clients.push(client0, client1);
        }
        if (this.game.clients[0].connectedTo !== undefined && this.game.clients[1].connectedTo !== undefined) {
            this.advance = true;
        }
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}
class TutorialStep14 extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker, newGame) {
        super(13, [
            'Excellent! By now you should know all the basics.',
            'This tutorial is finished.',
            'You can start a new game or go back to the main menu.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
        const w = canvas.width, h = canvas.height;
        this.hasHome = true;
        this.extraButtons = [
            new Button(w / 3, h - 40, 120, 40, 'New game', '#FFFFFF', () => newGame.execute())
        ];
    }
    run() {
        this.orchestrator.updateMessages();
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}
class BorderButton extends Button {
    hoverColor;
    borderWidth;
    constructor(x, y, width, height, text, color, hoverColor, borderWidth, onClick) {
        super(x, y, width, height, text, color, onClick);
        this.hoverColor = hoverColor;
        this.borderWidth = borderWidth;
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
        Utilities.drawText({
            x: this.x,
            y: this.y,
            text: this.text,
            font: '15px monospace',
            align: 'center',
            color
        }, context);
    }
}
class Upgrade {
    canvas;
    game;
    upgradesTracker;
    scheduler;
    gameArea;
    fader;
    id = Defaults.gameModes.UPGRADE;
    constructor(canvas, game, upgradesTracker, scheduler, gameArea, fader) {
        this.canvas = canvas;
        this.game = game;
        this.upgradesTracker = upgradesTracker;
        this.scheduler = scheduler;
        this.gameArea = gameArea;
        this.fader = fader;
    }
    getButtons() {
        const w = this.canvas.width, h = this.canvas.height;
        let buttons = [new Button(w / 2, h - 100, 120, 40, 'Cancel', '#333333', () => this.game.switchMode(Defaults.gameModes.PAUSE))];
        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
                buttons = [...buttons, ...this.createServerButtons(s => s.speed += 2)];
                break;
            case 'capacity':
                buttons = [...buttons, ...this.createServerButtons(s => s.capacity += Defaults.serversCapacity)];
                break;
            case 'server':
                buttons = [...buttons,
                    this.createAreaButton(Math.floor(w / 6), Math.floor(h / 6), 'nw'),
                    this.createAreaButton(Math.floor(w / 2), Math.floor(h / 6), 'n'),
                    this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h / 6), 'ne'),
                    this.createAreaButton(Math.floor(w / 6), Math.floor(h / 2), 'w'),
                    this.createAreaButton(Math.floor(w / 2), Math.floor(h / 2), 'c'),
                    this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h / 2), 'e'),
                    this.createAreaButton(Math.floor(w / 6), Math.floor(h * 5 / 6), 'sw'),
                    this.createAreaButton(Math.floor(w / 2), Math.floor(h * 5 / 6), 's'),
                    this.createAreaButton(Math.floor(w * 5 / 6) + 1, Math.floor(h * 5 / 6), 'se')
                ];
                break;
        }
        return buttons;
    }
    update() {
        const context = this.canvas.getContext('2d'), w = this.canvas.width, h = this.canvas.height;
        context.clearRect(0, 0, w, h);
        this.gameArea.drawServers();
        let text;
        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
            case 'capacity':
                text = 'location';
                break;
            case 'server':
                text = 'zone';
                break;
        }
        Utilities.drawText({
            x: w / 2,
            y: 60,
            text: `~ Select ${text} ~`,
            font: '30px monospace',
            align: 'center',
            color: 'red'
        }, context);
    }
    createAreaButton(x, y, area) {
        const w = this.canvas.width, h = this.canvas.height;
        return new BorderButton(x, y, Math.floor(w / 3) - 2, Math.floor(h / 3) - 2, '', '#CCCCCC', 'limeGreen', 1, () => {
            this.scheduler.createServer(area);
            this.selectUpgrade();
        });
    }
    createServerButton(server, action) {
        return new BorderButton(server.x, server.y, Defaults.serverSize, Defaults.serverSize, '', 'rgba(0,0,0,0)', 'limeGreen', 2, () => {
            action();
            this.selectUpgrade();
        });
    }
    createServerButtons(action) {
        return this.game.servers.map((s) => this.createServerButton(s, () => action(s)));
    }
    selectUpgrade() {
        this.upgradesTracker.selectedUpgrade = undefined;
        this.upgradesTracker.upgradesAvailable -= 1;
        this.fader.removeFromPermanentQueue('upgrade');
        this.game.switchMode(Defaults.gameModes.PAUSE);
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
class Application {
    scenes;
    game;
    ui;
    cursor;
    canvas;
    fpsCounter;
    clouds;
    activeScene;
    logActive = false;
    constructor(scenes, game, ui, cursor, canvas, fpsCounter, clouds) {
        this.scenes = scenes;
        this.game = game;
        this.ui = ui;
        this.cursor = cursor;
        this.canvas = canvas;
        this.fpsCounter = fpsCounter;
        this.clouds = clouds;
        const w = canvas.width, h = canvas.height;
        this.activeScene = scenes[0];
        clouds.setSkyColor('#0360AE');
        this.createCloud(w / 4, h / 4);
        this.createCloud(0 - w / 4, h / 3);
        this.createCloud(w / 2, h / 2);
        this.createCloud(0 - w / 2, h * 3 / 4);
        this.createCloud(w * 3 / 4, h * 2 / 3);
        this.createCloud(0 - w * 3 / 4, h / 2);
        document.addEventListener("keypress", e => this.keyboardHandler(e));
        window.addEventListener('blur', () => this.blurHandler());
    }
    static build(clouds) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext("2d");
        const music = new Audio("assets/music.mp3");
        const fader = new TextFader(context);
        const fpsCounter = new FpsCounter();
        const orchestrator = new MessageOrchestrator();
        const upgradesTracker = new UpgradesTracker();
        const popularityTracker = new PopularityTracker(fader, upgradesTracker, canvas);
        const ui = new GameUI(music, canvas);
        const game = new GameTracker(popularityTracker, ui);
        const cursor = new CursorTracker(game, canvas, ui);
        const scheduler = new Scheduler(popularityTracker, fader, orchestrator, canvas, game);
        const gameArea = new GameArea(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader);
        const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, scheduler, fader);
        const credits = new Credits(canvas, clouds, game);
        const gameOver = new GameOver(canvas, clouds, game, orchestrator, popularityTracker, newGame);
        const pause = new Pause(canvas, clouds, game, upgradesTracker, ui, newGame);
        const upgrade = new Upgrade(canvas, game, upgradesTracker, scheduler, gameArea, fader);
        const gameScene = new Game(canvas, game, scheduler, orchestrator, gameArea, fader);
        const tutorial = new Tutorial([
            new TutorialStep1(canvas, game),
            new TutorialStep2(canvas),
            new TutorialStep3(canvas, game, orchestrator, popularityTracker),
            new TutorialStep4(game),
            new TutorialStep5(canvas, game, orchestrator, popularityTracker),
            new TutorialStep6(canvas, game, orchestrator, popularityTracker),
            new TutorialStep7(canvas, game, orchestrator, popularityTracker),
            new TutorialStep8(canvas, game, orchestrator, popularityTracker, fader),
            new TutorialStep9(canvas, game, fader),
            new TutorialStep10(canvas, game, orchestrator, popularityTracker),
            new TutorialStep11(canvas, game, orchestrator, popularityTracker, fader),
            new TutorialStep12(canvas, game, fader),
            new TutorialStep13(canvas, game, orchestrator, popularityTracker),
            new TutorialStep14(canvas, game, orchestrator, popularityTracker, newGame)
        ], canvas, gameArea, fader, game, orchestrator);
        const menu = new Menu(canvas, clouds, game, ui, tutorial, newGame);
        cursor.bind();
        music.loop = true;
        return new Application([
            menu,
            gameScene,
            gameOver,
            credits,
            pause,
            upgrade,
            tutorial
        ], game, ui, cursor, canvas, fpsCounter, clouds);
    }
    run() {
        setInterval(() => this.mainLoop(), 1000 / Defaults.frameRate);
    }
    mainLoop() {
        if (this.activeScene.id !== this.game.currentGameMode) {
            this.activeScene = this.scenes.find(s => s.id === this.game.currentGameMode);
        }
        this.clouds.update(1000 / Defaults.frameRate);
        this.activeScene.update();
        this.ui.buttons = this.activeScene.getButtons();
        this.drawButtons();
        if (this.logActive) {
            this.fpsCounter.update();
            this.fpsCounter.logFps();
        }
    }
    createCloud(x, y) {
        const w = this.getRandomInt(350, 500), h = this.getRandomInt(w, 700), circles = this.getRandomInt(15, 30), n = this.getRandomInt(180, 255), color = { r: n, g: n, b: n, a: .1 }, speed = this.getRandomInt(100, 200);
        this.clouds.add(x, y, w, h, circles, color, speed);
    }
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    drawButtons() {
        const context = this.canvas.getContext('2d'), mouseX = this.cursor.mouseX, mouseY = this.cursor.mouseY;
        this.ui.buttons.forEach((button) => {
            const hovered = mouseX > button.x - (button.width + 2) / 2 &&
                mouseX < button.x + (button.width + 2) / 2 &&
                mouseY > button.y - (button.height + 4) / 2 &&
                mouseY < button.y + (button.height + 2) / 2;
            button.draw(hovered, context);
        });
    }
    blurHandler() {
        if (this.game.currentGameMode === Defaults.gameModes.GAME) {
            this.game.switchMode(Defaults.gameModes.PAUSE);
        }
    }
    keyboardHandler(event) {
        event.preventDefault();
        switch (event.key) {
            case ' ':
                const game = this.game;
                if (game.currentGameMode === Defaults.gameModes.GAME) {
                    game.switchMode(Defaults.gameModes.PAUSE);
                }
                else if (game.currentGameMode === Defaults.gameModes.PAUSE) {
                    game.switchMode(Defaults.gameModes.GAME);
                }
        }
    }
}
