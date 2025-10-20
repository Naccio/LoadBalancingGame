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
class SpecialButton {
    x;
    y;
    width;
    height;
    color;
    hoverColor;
    borderWidth;
    onClick;
    specialDraw;
    constructor(x, y, width, height, color, hoverColor, borderWidth, onClick, specialDraw) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.hoverColor = hoverColor;
        this.borderWidth = borderWidth;
        this.onClick = onClick;
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
class Defaults {
    static clientSize = 30;
    static defaultColor = 'black';
    static frameRate = 60;
    static messageVelocity = 200;
    static serversSpeed = 3.5;
    static serversCapacity = 80;
}
class Utilities {
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
    static drawText(x, y, text, font, align, baseline, color, context) {
        context.font = font;
        context.textAlign = align;
        context.textBaseline = baseline;
        context.fillStyle = color;
        context.fillText(text, x, y);
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
