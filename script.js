"use strict";
class Message {
    sender;
    receiver;
    position;
    dx;
    dy;
    status;
    life;
    constructor(sender, receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.position = { ...sender.position };
        this.dx = 0;
        this.dy = 0;
        this.sender = sender;
        this.receiver = receiver;
        this.status = 'req';
        this.life = 0;
        this.computeVelocity();
    }
    computeVelocity() {
        const rp = this.receiver.position, p = this.position, xDiff = rp.x - p.x, yDiff = rp.y - p.y, angle = Math.atan2(yDiff, xDiff), v = Defaults.messageVelocity / Defaults.frameRate;
        this.dx = Math.cos(angle) * v;
        this.dy = Math.sin(angle) * v;
    }
    move() {
        const p = this.position;
        this.position = {
            x: p.x + this.dx,
            y: p.y + this.dy
        };
    }
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
            if (m.status === 'req') {
                if (m.sender.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }
            if (m.status === 'ack' || m.status === 'nack') {
                if (m.receiver.connectedTo === undefined) {
                    this.messages.splice(i--, 1);
                    continue;
                }
            }
            if (m.status === 'done') {
                this.messages.splice(i--, 1);
                continue;
            }
            if (m.status != 'queued') {
                const r = m.receiver, mp = m.position, rp = r.position;
                if (mp.x < rp.x + clientSize / 2 && mp.x > rp.x - clientSize / 2 &&
                    mp.y < rp.y + clientSize / 2 && mp.y > rp.y - clientSize / 2)
                    r.receiveMessage(m);
                else
                    m.move();
            }
        }
    }
}
class Attacker {
    orchestrator;
    position;
    messages;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    messagesToReceive;
    constructor(orchestrator, position, messages, connectedTo) {
        this.orchestrator = orchestrator;
        this.position = position;
        this.messages = messages;
        this.connectedTo = connectedTo;
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
        message.status = 'done';
        this.messagesToReceive -= 1;
    }
    ;
}
class Defaults {
    static accentColor = '#ff0000';
    static accentColorMuted = '#fa8072';
    static attackerBorderColor = '#000000';
    static attackerColor = '#333333';
    static attackerConnectionColor = '#696969';
    static attackerTextColor = '#ffffff';
    static backgroundBorderColor = '#02467f';
    static backgroundColor = '#0360ae';
    static clientBorderColor = '#696969';
    static clientColor = '#808080';
    static clientConnectionColor = '#a9a9a9';
    static clientSize = 30;
    static clientSpeed = 2;
    static clientTextColor = '#ffffff';
    static dangerColor = '#ff0000';
    static dangerColorDark = '#b22222';
    static dangerColorMuted = '#ff6347';
    static dangerColorMutedDark = '#cd5c5c';
    static defaultColor = '#000000';
    static frameRate = 60;
    static gameLength = 5;
    static highlightColor = '#add8e6';
    static highlightWidth = 3;
    static maxClientWaitTime = 9;
    static messageAckBorderColor = '#32cd32';
    static messageAckColor = '#00ff00';
    static messageNackBorderColor = Defaults.dangerColorMutedDark;
    static messageNackColor = Defaults.dangerColorMuted;
    static messageReqBorderColor = '#87ceeb';
    static messageReqColor = '#add8e6';
    static messageSize = 6;
    static messageVelocity = 200;
    static primaryColor = '#ffffff';
    static primaryColorMuted = '#dddddd';
    static primaryColorMutedTransparent = 'rgba(200,200,200,.5)';
    static primaryColorTransparent = 'rgba(255,255,255,.6)';
    static secondaryColor = '#333333';
    static secondaryColorTransparent = 'rgba(0,0,0,.1)';
    static secondaryColorMuted = '#a9a9a9';
    static serverCapacity = 80;
    static serverBorderColor = '#004500';
    static serverColor = '#008000';
    static serverSize = 40;
    static serverSpeed = 3.5;
    static successColor = '#00ff00';
    static gameModes = { MENU: 0, GAME: 1, GAME_OVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
    static serverDefaults = {
        size: Defaults.serverSize,
        color: Defaults.serverColor,
        borderColor: Defaults.serverBorderColor,
        queueColor: Defaults.serverColor,
        queueBorderColor: Defaults.serverBorderColor,
        speedColor: Defaults.successColor,
        speedBorderColor: Defaults.serverBorderColor,
    };
    static serverDisabledDefaults = {
        size: Defaults.serverSize,
        color: '#DDDDDD',
        borderColor: '#999999',
        queueColor: '#BBBBBB',
        queueBorderColor: '#999999',
        speedColor: '#BBBBBB',
        speedBorderColor: '#999999',
    };
}
class Canvas {
    canvasElement;
    context;
    constructor(canvasElement) {
        this.canvasElement = canvasElement;
        const context = canvasElement.getContext('2d');
        if (!context) {
            throw 'Could not get 2D context from canvas';
        }
        this.context = context;
    }
    get center() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }
    get height() {
        return this.canvasElement.height;
    }
    get width() {
        return this.canvasElement.width;
    }
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
    createLinearGradient(x1, y1, x2, y2) {
        return this.context.createLinearGradient(x1, y1, x2, y2);
    }
    drawArrow(arrow) {
        const context = this.context, from = arrow.from, to = arrow.to, x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y, angle = Math.atan2(y2 - y1, x2 - x1), inverseAngle = Math.PI - angle, barbsAngle = arrow.barbsAngle ?? Math.PI / 5, barbsLength = arrow.barbsLength ?? 8, rightBarbAngle = barbsAngle - inverseAngle, leftBarbAngle = -barbsAngle - inverseAngle, rightBarbX = x2 + Math.cos(rightBarbAngle) * barbsLength, rightBarbY = y2 + Math.sin(rightBarbAngle) * barbsLength, leftBarbX = x2 + Math.cos(leftBarbAngle) * barbsLength, leftBarbY = y2 + Math.sin(leftBarbAngle) * barbsLength;
        context.strokeStyle = arrow?.color ?? Defaults.defaultColor;
        context.lineWidth = arrow?.width ?? 1;
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(rightBarbX, rightBarbY);
        context.moveTo(x2, y2);
        context.lineTo(leftBarbX, leftBarbY);
        context.stroke();
    }
    drawCircle(circle) {
        const context = this.context, p = circle.position;
        context.beginPath();
        context.arc(p.x, p.y, circle.radius, 0, Math.PI * 2, true);
        context.closePath();
        this.draw(circle);
    }
    drawLine(line) {
        const context = this.context, from = line.from, to = line.to;
        context.strokeStyle = line?.color ?? Defaults.defaultColor;
        context.lineWidth = line?.width ?? 1;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
    }
    drawPolygon(polygon) {
        const context = this.context, points = [...polygon.points], start = points.shift();
        context.beginPath();
        context.moveTo(start.x, start.y);
        points.forEach(p => context.lineTo(p.x, p.y));
        context.closePath();
        this.draw(polygon);
    }
    drawRect(rectangle) {
        const context = this.context, p = rectangle.position, w = rectangle.width, h = rectangle.height;
        context.beginPath();
        context.rect(p.x - w / 2, p.y - h / 2, w, h);
        context.closePath();
        this.draw(rectangle);
    }
    drawStar(star) {
        const context = this.context, centerX = star.position.x, centerY = star.position.y, spikes = star.spikes ?? 5, outerRadius = star.outerRadius, innerRadius = star.innerRadius, step = Math.PI / spikes;
        let x, y, rot = Math.PI / 2 * 3;
        context.beginPath();
        context.moveTo(centerX, centerY - outerRadius);
        for (let i = 0; i < spikes; i += 1) {
            x = centerX + Math.cos(rot) * outerRadius;
            y = centerY + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;
            x = centerX + Math.cos(rot) * innerRadius;
            y = centerY + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }
        context.lineTo(centerX, centerY - outerRadius);
        context.closePath();
        this.draw(star);
    }
    drawText(text) {
        const context = this.context, p = text.position, fontFamily = text.fontFamily ?? 'monospace';
        let font = `${text.fontSize}px ${fontFamily}`;
        if (text.fontVariant) {
            font = `${text.fontVariant} ${font}`;
        }
        if (text.fontWeight) {
            font = `${text.fontWeight} ${font}`;
        }
        context.font = font;
        context.textAlign = text.align ?? 'start';
        context.textBaseline = text.baseline ?? 'middle';
        context.fillStyle = text.color ?? Defaults.defaultColor;
        context.fillText(text.text, p.x, p.y);
    }
    drawTriangle(triangle) {
        const context = this.context, x = triangle.position.x, y = triangle.position.y, b = triangle.base, h = triangle.height;
        context.beginPath();
        context.moveTo(x, y - h / 2);
        context.lineTo(x + b / 2, y + h / 2);
        context.lineTo(x - b / 2, y + h / 2);
        this.draw(triangle);
    }
    draw(shape) {
        const context = this.context;
        if (shape.color) {
            context.fillStyle = shape.color;
            context.fill();
        }
        if (shape.borderColor) {
            context.strokeStyle = shape.borderColor;
            context.lineWidth = shape.borderWidth ?? 1;
            context.stroke();
        }
    }
}
class TextFader {
    canvas;
    queues;
    constructor(canvas) {
        this.canvas = canvas;
        this.queues = { permanent: [], temporary: [] };
    }
    draw() {
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];
            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                this.drawText(text, queue.position);
            }
        }
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];
            this.drawText(text, text.position);
        }
    }
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
    addText(text) {
        const id = this.getId(text.position);
        let queue = this.queues.temporary.find(q => q.id == id);
        if (!queue) {
            queue = this.createQueue(text.position);
        }
        text.life ??= 1000;
        text.alpha = text.fadeIn ? 0 : 1;
        text.delta = 0;
        queue.queuedTexts.push(text);
    }
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
    removeFromPermanentQueue(id) {
        for (let i = 0; i < this.queues.permanent.length; i++) {
            if (this.queues.permanent[i].id === id) {
                this.queues.permanent.splice(i, 1);
                return;
            }
        }
    }
    emptyQueues() {
        this.queues = { permanent: [], temporary: [] };
    }
    createQueue(position) {
        const queue = {
            id: this.getId(position),
            position: { ...position },
            activeTexts: [],
            queuedTexts: []
        };
        this.queues.temporary.push(queue);
        return queue;
    }
    drawText(text, position) {
        const delta = text.delta ?? 0, { r, g, b } = text.rgbColor, a = text.alpha, color = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.canvas.drawText({
            ...text,
            position: {
                x: position.x,
                y: position.y - delta
            },
            fontFamily: 'Arial',
            align: 'center',
            color
        });
    }
    getId(position) {
        return position.x.toString() + position.y.toString();
    }
}
class Utilities {
    static defaultButton(position, text, onClick) {
        return new SimpleButton(position, 120, 40, text, Defaults.primaryColor, onClick);
    }
    static drawCircleHighlight(position, radius, canvas) {
        const innerCircle = {
            position,
            radius,
            borderColor: 'fireBrick',
            borderWidth: 2
        }, outerCircle = {
            ...innerCircle,
            radius: radius + 1,
            borderColor: 'red'
        };
        canvas.drawCircle(innerCircle);
        canvas.drawCircle(outerCircle);
    }
    static drawServer(server, options, canvas) {
        options = {
            ...Defaults.serverDefaults,
            ...options
        };
        const size = options.size, p = server.position;
        let i = Math.max(0, server.capacity / Defaults.serverCapacity - 1);
        for (; i > -1; i -= 1) {
            canvas.drawRect({
                position: {
                    x: p.x + 3 * i,
                    y: p.y - 3 * i
                },
                width: size,
                height: size,
                color: options.color,
                borderColor: options.borderColor
            });
        }
        const speed = Defaults.serverSpeed, queueWidth = 5, queueHeight = size - 10, queueX = p.x + size / 2 - 7, queueY = p.y + 1, fillPercentage = (server.queue.length / server.capacity) * 100, gradientWidth = 5, gradientHeight = fillPercentage * queueHeight / 100, gradientX = queueX, gradientY = queueY + queueHeight / 2 - gradientHeight / 2;
        canvas.drawRect({
            position: {
                x: queueX,
                y: queueY
            },
            width: queueWidth + 2,
            height: queueHeight + 2,
            color: options.queueColor,
            borderColor: options.queueBorderColor
        });
        const gradient = canvas.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
        gradient.addColorStop(0.5, Defaults.successColor);
        gradient.addColorStop(1, Defaults.dangerColor);
        canvas.drawRect({
            position: {
                x: gradientX,
                y: gradientY
            },
            width: gradientWidth,
            height: gradientHeight,
            color: gradient
        });
        for (i = server.speed; i > 0; i -= speed) {
            const starX = p.x - size / 2 + 7, starY = p.y + size / 2 - 4 - 5 * (i / speed);
            canvas.drawStar({
                position: {
                    x: starX,
                    y: starY
                },
                outerRadius: 4,
                innerRadius: 2,
                color: options.speedColor,
                borderColor: options.speedBorderColor
            });
        }
    }
    static getDistance(p1, p2) {
        var xs = p2.x - p1.x, ys = p2.y - p1.y;
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
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
        this.canvas.drawText({
            position: {
                x: 10,
                y
            },
            text: 'Popularity: ' + this.popularity,
            fontSize: 18,
            fontFamily: 'sans-serif'
        });
    }
    reset() {
        this.popularity = 0;
    }
    updatePopularity(client, amount) {
        let fontSize = amount >= 5 ? 16 : 12, color = amount < 0
            ? { r: 150, g: 0, b: 0 }
            : { r: 0, g: 150, b: 0 }, position = {
            x: client.position.x,
            y: client.position.y - 8 - Defaults.clientSize / 2
        };
        this.fader.addText({
            text: amount.toString(),
            rgbColor: color,
            fontSize: fontSize,
            fontWeight: 'bold',
            alpha: 1,
            delta: 0,
            position
        });
        this.popularity += amount;
        if (this.popularity >= this.upgrades.nextUpgrade) {
            this.upgrades.increaseUpgrades();
        }
    }
}
class Client {
    orchestrator;
    popularity;
    position;
    messages;
    life;
    connectedTo;
    lastMessageTime;
    messagesToSend;
    ACKsToReceive;
    NACKsToDie;
    constructor(orchestrator, popularity, position, messages) {
        this.orchestrator = orchestrator;
        this.popularity = popularity;
        this.position = position;
        this.messages = messages;
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
        if (message.status === 'ack') {
            this.ACKsToReceive -= 1;
            n = 1;
            if (this.ACKsToReceive === 0) {
                n += 5;
            }
            this.orchestrator.registerAck(message);
            this.popularity.updatePopularity(this, n);
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
            this.popularity.updatePopularity(this, n);
        }
        message.status = 'done';
    }
    ;
}
class Server {
    position;
    queue;
    lastMessageTime;
    capacity;
    speed;
    constructor(position) {
        this.position = position;
        this.queue = [];
        this.lastMessageTime = 0;
        this.capacity = Defaults.serverCapacity;
        this.speed = Defaults.serverSpeed;
    }
    sendMessage(elapsedTime) {
        const msg = this.queue.shift();
        if (msg) {
            msg.status = 'ack';
            msg.invertDirection();
            this.lastMessageTime = elapsedTime;
        }
    }
    ;
    receiveMessage(message) {
        message.position = { ...this.position };
        if (this.queue.length < this.capacity) {
            this.queue.push(message);
            message.status = 'queued';
        }
        else {
            message.status = 'nack';
            message.invertDirection();
        }
    }
    ;
}
class VolumeButton {
    position;
    onClick;
    width;
    height;
    isOn = false;
    constructor(position, size, onClick) {
        this.position = position;
        this.onClick = onClick;
        this.width = size;
        this.height = size;
    }
    draw(hovered, canvas) {
        const p = this.position, w = this.width, h = this.height, color = hovered ? Defaults.primaryColor : Defaults.primaryColorTransparent, status = this.isOn ? 'On' : 'Off';
        canvas.drawRect({
            position: {
                x: p.x - w / 4 + 1,
                y: p.y
            },
            width: w / 4 + 1,
            height: h / 2 - 1,
            color
        });
        canvas.drawPolygon({
            position: p,
            points: [{
                    x: p.x - 1,
                    y: p.y - h / 4
                }, {
                    x: p.x + w / 4,
                    y: p.y - h / 2 + 1
                }, {
                    x: p.x + w / 4,
                    y: p.y + h / 2 - 1
                }, {
                    x: p.x - 1,
                    y: p.y + h / 4
                }],
            color
        });
        if (!this.isOn) {
            canvas.drawLine({
                from: {
                    x: p.x - w / 2,
                    y: p.y + h / 2
                },
                to: {
                    x: p.x + w / 2,
                    y: p.y - h / 2
                },
                color: Defaults.accentColor,
                width: 2
            });
        }
        if (hovered) {
            canvas.drawText({
                position: {
                    x: p.x,
                    y: p.y + w / 2 + 2
                },
                text: 'Music: ' + status,
                fontSize: 10,
                align: 'center',
                baseline: 'top',
                color: Defaults.primaryColor
            });
        }
    }
}
class GameUI {
    buttons = [];
    volumeButton;
    constructor(music, canvas) {
        const w = canvas.width, h = canvas.height, p = {
            x: w - 40,
            y: h - 40
        };
        this.volumeButton = new VolumeButton(p, 20, () => {
            if (music.paused) {
                music.play();
            }
            else {
                music.pause();
            }
            this.volumeButton.isOn = !music.paused;
        });
    }
    click(x, y) {
        this.buttons.some((button) => {
            const p = button.position;
            if (x > p.x - button.width / 2 && x < p.x + button.width / 2 &&
                y > p.y - button.height / 2 && y < p.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}
class GameTracker {
    popularityTracker;
    ui;
    orchestrator;
    selectedClient;
    currentGameMode = 0;
    clientsServed = 0;
    droppedConnections = 0;
    failedConnections = 0;
    elapsedTime = 0;
    servers = [];
    clients = [];
    attackers = [];
    constructor(popularityTracker, ui, orchestrator) {
        this.popularityTracker = popularityTracker;
        this.ui = ui;
        this.orchestrator = orchestrator;
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
        this.orchestrator.updateMessages();
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
                    this.popularityTracker.updatePopularity(c, -10);
                }
            }
            else {
                if (c.messagesToSend > 0 && (elapsedTime - c.lastMessageTime) > 1 / Defaults.clientSpeed) {
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
            if (a.messagesToSend != 0 && elapsedTime - a.lastMessageTime > 0.5 / Defaults.clientSpeed) {
                a.sendMessage(elapsedTime);
            }
        }
    }
}
class AttackerFactory {
    game;
    orchestrator;
    constructor(game, orchestrator) {
        this.game = game;
        this.orchestrator = orchestrator;
    }
    create(position, messages, server) {
        const attacker = new Attacker(this.orchestrator, position, messages, server);
        this.game.attackers.push(attacker);
        return attacker;
    }
}
class ClientFactory {
    game;
    orchestrator;
    popularityTracker;
    constructor(game, orchestrator, popularityTracker) {
        this.game = game;
        this.orchestrator = orchestrator;
        this.popularityTracker = popularityTracker;
    }
    create(position, messages) {
        const client = new Client(this.orchestrator, this.popularityTracker, position, messages);
        this.game.clients.push(client);
        return client;
    }
}
class ServerFactory {
    game;
    constructor(game) {
        this.game = game;
    }
    create(position) {
        const server = new Server(position);
        this.game.servers.push(server);
        return server;
    }
}
class Scheduler {
    popularityTracker;
    canvas;
    game;
    clientFactory;
    attackerFactory;
    serverFactory;
    timeLastDDoS = 0;
    minClientMessages = 25;
    maxClientMessages = 35;
    attackersMessages = 30;
    attackersNumber = 1;
    spawnRate = 6;
    attackRate = 80;
    timeLastClient = 1 - this.spawnRate;
    constructor(popularityTracker, canvas, game, clientFactory, attackerFactory, serverFactory) {
        this.popularityTracker = popularityTracker;
        this.canvas = canvas;
        this.game = game;
        this.clientFactory = clientFactory;
        this.attackerFactory = attackerFactory;
        this.serverFactory = serverFactory;
    }
    schedule() {
        const popularity = this.popularityTracker.popularity, elapsedTime = this.game.elapsedTime, remaining = Defaults.gameLength * 60 - elapsedTime;
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
            case 'nw':
                minX = serverSize;
                minY = serverSize;
                maxX = width / 3;
                maxY = height / 3;
                break;
            case 'n':
                minX = width / 3;
                minY = serverSize;
                maxX = width * 2 / 3;
                maxY = height / 3;
                break;
            case 'ne':
                minX = width * 2 / 3;
                minY = serverSize;
                maxX = width - serverSize;
                maxY = height / 3;
                break;
            case 'w':
                minX = serverSize;
                minY = height / 3;
                maxX = width / 3;
                maxY = height * 2 / 3;
                break;
            case 'c':
                minX = width / 3;
                minY = height / 3;
                maxX = width * 2 / 3;
                maxY = height * 2 / 3;
                break;
            case 'e':
                minX = width * 2 / 3;
                minY = height / 3;
                maxX = width - serverSize;
                maxY = height * 2 / 3;
                break;
            case 'sw':
                minX = serverSize;
                minY = height * 2 / 3;
                maxX = width / 3;
                maxY = height - serverSize;
                break;
            case 's':
                minX = width / 3;
                minY = height * 2 / 3;
                maxX = width * 2 / 3;
                maxY = height - serverSize;
                break;
            case 'se':
                minX = width * 2 / 3;
                minY = height * 2 / 3;
                maxX = width - serverSize;
                maxY = height - serverSize;
                break;
            default:
                throw `Invalid zone: ${zone}.`;
        }
        x = Utilities.random(minX, maxX);
        y = Utilities.random(minY, maxY);
        while (this.checkCollisions({ x, y })) {
            x = Utilities.random(minX, maxX);
            y = Utilities.random(minY, maxY);
        }
        this.serverFactory.create({ x, y });
    }
    ;
    createClient() {
        const width = this.canvas.width, height = this.canvas.height, elapsedTime = this.game.elapsedTime, clientSize = Defaults.clientSize, minX = clientSize, maxX = width - clientSize, minY = clientSize, maxY = height - clientSize, messages = Utilities.random(this.minClientMessages, this.maxClientMessages) + Math.floor(this.popularityTracker.popularity / 100);
        let x = Utilities.random(minX, maxX), y = Utilities.random(minY, maxY);
        while (this.checkCollisions({ x, y })) {
            x = Utilities.random(minX, maxX);
            y = Utilities.random(minY, maxY);
        }
        this.clientFactory.create({ x, y }, messages);
        this.timeLastClient = elapsedTime;
    }
    ;
    initiateDDoS() {
        const width = this.canvas.width, height = this.canvas.height, elapsedTime = this.game.elapsedTime, clientSize = Defaults.clientSize, minX = clientSize, maxX = width - clientSize, minY = clientSize, maxY = height - clientSize, modifier = Math.floor(this.popularityTracker.popularity / 400), messages = this.attackersMessages + modifier, number = this.attackersNumber + modifier;
        for (let i = 0; i < number; i += 1) {
            let x = Utilities.random(minX, maxX), y = Utilities.random(minY, maxY);
            while (this.checkCollisions({ x, y })) {
                x = Utilities.random(minX, maxX);
                y = Utilities.random(minY, maxY);
            }
            const server = this.findClosestServer({ x, y });
            if (server) {
                this.attackerFactory.create({ x, y }, messages, server);
            }
        }
        this.timeLastDDoS = elapsedTime;
    }
    ;
    checkCollisions(position) {
        const serverSize = Defaults.serverSize, clientSize = Defaults.clientSize, servers = this.game.servers, clients = this.game.clients, attackers = this.game.attackers, { x, y } = position;
        for (let i = 0; i < servers.length; i += 1) {
            const p = servers[i].position;
            if (Math.abs(x - p.x) < serverSize && Math.abs(y - p.y) < 2 * serverSize) {
                return true;
            }
        }
        for (let i = 0; i < clients.length; i += 1) {
            const p = clients[i].position;
            if (Math.abs(x - p.x) < clientSize && Math.abs(y - p.y) < clientSize) {
                return true;
            }
        }
        for (let i = 0; i < attackers.length; i += 1) {
            const p = attackers[i].position;
            if (Math.abs(x - p.x) < clientSize && Math.abs(y - p.y) < clientSize) {
                return true;
            }
        }
    }
    findClosestServer(position) {
        let closest, currentDistance = this.canvas.width;
        this.game.servers.forEach((server) => {
            const newDistance = Utilities.getDistance(position, server.position);
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
class SimpleButton {
    position;
    width;
    height;
    text;
    color;
    onClick;
    constructor(position, width, height, text, color, onClick) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.onClick = onClick;
    }
    draw(hovered, canvas) {
        const color = hovered ? Utilities.invertColor(this.color) : this.color;
        canvas.drawRect({
            position: this.position,
            width: this.width,
            height: this.height,
            color: hovered ? this.color : undefined,
            borderColor: this.color,
            borderWidth: 2
        });
        canvas.drawText({
            position: this.position,
            text: this.text,
            fontSize: 15,
            align: 'center',
            color
        });
    }
    ;
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
        this.buttons = [Utilities.defaultButton({
                x: w / 2,
                y: h - 60
            }, 'Back', () => {
                game.switchMode(Defaults.gameModes.MENU);
            })];
    }
    getButtons() {
        return this.buttons;
    }
    draw() {
        this.clouds.draw();
        this.drawCredits(128, 'An idea by:', 'Treestle', '(treestle.com)');
        this.drawCredits(258, 'Designed and developed by:', 'Naccio', '(naccio.net)');
        this.drawCredits(388, 'Music by:', 'Macspider', '(soundcloud.com/macspider)');
    }
    update() { }
    drawCredits(y, heading, text, subText) {
        this.drawRect(y);
        this.drawHeading(y - 28, heading);
        this.drawMainText(y, text);
        this.drawSubText(y + 28, subText);
    }
    drawRect(y) {
        const w = this.canvas.width;
        this.canvas.drawRect({
            position: {
                x: w / 2,
                y
            },
            width: w,
            height: 100,
            color: Defaults.secondaryColorTransparent,
            borderColor: Defaults.primaryColorMutedTransparent
        });
    }
    drawHeading(y, text) {
        this.drawText(y, text, 20, Defaults.accentColor, 'bold');
    }
    drawMainText(y, text) {
        this.drawText(y, text, 30, Defaults.primaryColor);
    }
    drawSubText(y, text) {
        this.drawText(y, text, 15, Defaults.primaryColorMuted);
    }
    drawText(y, text, fontSize, color, fontWeight) {
        const w = this.canvas.width;
        this.canvas.drawText({
            position: {
                x: w / 2,
                y
            },
            text,
            fontSize,
            fontWeight,
            align: 'center',
            color
        });
    }
}
class CursorTracker {
    game;
    canvas;
    ui;
    mousePosition;
    constructor(game, canvas, ui) {
        this.game = game;
        this.canvas = canvas;
        this.ui = ui;
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
    clickHandler(event) {
        const canvas = this.canvas, x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop;
        this.ui.click(x, y);
    }
    cursorPositionHandler(x, y) {
        const game = this.game, gameModes = Defaults.gameModes, clientSize = Defaults.clientSize, serverSize = Defaults.serverSize;
        if (game.currentGameMode == gameModes.GAME || game.currentGameMode == gameModes.TUTORIAL) {
            if (game.selectedClient !== undefined) {
                game.servers.forEach(function (server) {
                    const p = server.position;
                    if (x > p.x - serverSize / 2 - 5 && x < p.x + serverSize / 2 + 5 &&
                        y > p.y - serverSize / 2 - 5 && y < p.y + serverSize / 2 + 5) {
                        game.selectedClient.connectedTo = server;
                    }
                });
            }
            game.selectedClient = undefined;
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
                    const p = server.position;
                    if (x > p.x - serverSize / 2 - 5 && x < p.x + serverSize / 2 + 5 &&
                        y > p.y - serverSize / 2 - 5 && y < p.y + serverSize / 2 + 5) {
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
                const mp = this.mousePosition, cp = game.selectedClient.position, serverSize = Defaults.serverSize, clientSize = Defaults.clientSize;
                game.servers.forEach(function (server) {
                    const sp = server.position;
                    if (mp.x > sp.x - serverSize / 2 - 5 && mp.x < sp.x + serverSize / 2 + 5
                        && mp.y > sp.y - serverSize / 2 - 5 && mp.y < sp.y + serverSize / 2 + 5) {
                        game.selectedClient.connectedTo = server;
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
        const position = this.game.selectedClient?.position;
        if (position !== undefined) {
            this.canvas.drawLine({
                from: position,
                to: this.cursor.mousePosition,
                color: Defaults.highlightColor,
                width: Defaults.highlightWidth
            });
            this.canvas.drawCircle({
                position,
                radius: Defaults.clientSize / 2 + Defaults.highlightWidth,
                color: Defaults.highlightColor
            });
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
        this.game.clients.forEach(c => this.drawConnection(c, Defaults.clientConnectionColor));
        this.game.attackers.forEach(a => this.drawConnection(a, Defaults.attackerConnectionColor));
    }
    drawMessages() {
        this.orchestrator.messages.forEach(m => this.drawMessage(m));
    }
    drawServers() {
        this.game.servers.forEach(s => this.drawServer(s));
    }
    drawUI() {
        const w = this.canvas.width, h = this.canvas.height;
        this.fader.draw();
        this.popularityTracker.draw(h - 14);
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h - 14
            },
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            baseline: 'alphabetic',
            color: Defaults.secondaryColorMuted
        });
        if (this.upgradesTracker.upgradesAvailable > 0) {
            const text = {
                position: {
                    x: w / 2,
                    y: h - 35
                },
                fontSize: 20,
                rgbColor: { r: 255, g: 0, b: 0 },
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
        let color = Defaults.secondaryColor;
        if (remaining <= 30) {
            color = Defaults.dangerColorMuted;
        }
        if (remaining <= 10) {
            color = Defaults.dangerColor;
        }
        this.canvas.drawText({
            position: {
                x: w - 10,
                y: h - 14
            },
            text,
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'end',
            baseline: 'alphabetic',
            color
        });
    }
    drawAttacker(attacker) {
        const size = Defaults.clientSize, position = attacker.position;
        this.canvas.drawTriangle({
            position,
            base: size * 2 / Math.sqrt(3),
            height: size,
            color: Defaults.attackerColor,
            borderColor: Defaults.attackerBorderColor,
            borderWidth: 2
        });
        this.canvas.drawText({
            position: {
                x: position.x,
                y: position.y + 8
            },
            text: 'DoS',
            fontWeight: 'bold',
            fontSize: 9,
            fontFamily: 'Arial',
            align: 'center',
            color: Defaults.attackerTextColor
        });
    }
    drawClient(client) {
        const clientSize = Defaults.clientSize, maxClientWaitTime = Defaults.maxClientWaitTime, position = client.position, circle = {
            position,
            radius: clientSize / 2,
            color: Defaults.clientColor,
            borderColor: Defaults.clientBorderColor
        };
        if (client.connectedTo === undefined) {
            if (client.connectedTo === undefined && client.life > maxClientWaitTime - 2) {
                this.canvas.drawCircle({
                    ...circle,
                    color: Defaults.dangerColor,
                    borderColor: Defaults.dangerColorDark
                });
            }
            else if (client.connectedTo === undefined && client.life > maxClientWaitTime - 3.5) {
                this.canvas.drawCircle({
                    ...circle,
                    color: Defaults.dangerColorMuted,
                    borderColor: Defaults.dangerColorMutedDark
                });
            }
            else {
                this.canvas.drawCircle(circle);
            }
            this.canvas.drawText({
                position,
                text: Math.round(maxClientWaitTime - client.life).toString(),
                fontWeight: 'bold',
                fontSize: 15,
                fontFamily: 'Arial',
                align: 'center',
                color: Defaults.clientTextColor
            });
        }
        else {
            this.canvas.drawCircle(circle);
        }
    }
    drawConnection(t, color) {
        if (t.connectedTo) {
            this.canvas.drawLine({
                from: t.position,
                to: t.connectedTo.position,
                color
            });
        }
    }
    drawMessage(message) {
        let color, borderColor;
        switch (message.status) {
            case 'queued':
            case 'done':
                return;
            case 'req':
                color = Defaults.messageReqColor;
                borderColor = Defaults.messageReqBorderColor;
                break;
            case 'ack':
                color = Defaults.messageAckColor;
                borderColor = Defaults.messageAckBorderColor;
                break;
            case 'nack':
                color = Defaults.messageNackColor;
                borderColor = Defaults.messageNackBorderColor;
                break;
            default:
                throw 'Invalid message status: ' + message.status;
        }
        this.canvas.drawCircle({
            position: message.position,
            radius: Defaults.messageSize / 2,
            color,
            borderColor
        });
    }
    drawServer(server) {
        Utilities.drawServer(server, {}, this.canvas);
    }
}
class Game {
    canvas;
    game;
    scheduler;
    gameArea;
    fader;
    id = Defaults.gameModes.GAME;
    constructor(canvas, game, scheduler, gameArea, fader) {
        this.canvas = canvas;
        this.game = game;
        this.scheduler = scheduler;
        this.gameArea = gameArea;
        this.fader = fader;
    }
    getButtons() {
        return [];
    }
    draw() {
        this.canvas.clear();
        this.gameArea.draw();
    }
    update() {
        if (this.game.servers.length === 0) {
            this.scheduler.createServer('c');
        }
        this.game.update();
        this.fader.update(1 / Defaults.frameRate);
        this.scheduler.schedule();
        var m = Math.floor(this.game.elapsedTime / 60);
        if (m === Defaults.gameLength && this.game.clients.length === 0) {
            this.game.switchMode(Defaults.gameModes.GAME_OVER);
        }
    }
}
class GameOver {
    canvas;
    clouds;
    game;
    orchestrator;
    popularity;
    color = Defaults.primaryColor;
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
            Utilities.defaultButton({ x: w / 2, y: h - 110 }, 'Restart', () => newGame.execute()),
            Utilities.defaultButton({ x: w / 2, y: h - 60 }, 'Menu', () => game.switchMode(Defaults.gameModes.MENU))
        ];
    }
    getButtons() {
        return this.buttons;
    }
    draw() {
        var w = this.canvas.width, h = this.canvas.height;
        this.clouds.draw();
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 100
            },
            text: 'Game Over',
            fontSize: 60,
            fontVariant: 'small-caps',
            align: 'center',
            color: Defaults.accentColor
        });
        this.drawStat(h / 2 - 80, 'Successful connections', this.game.clientsServed);
        this.drawStat(h / 2 - 55, 'Dropped connections', this.game.droppedConnections);
        this.drawStat(h / 2 - 30, 'Failed connections', this.game.failedConnections);
        this.drawStat(h / 2 - 5, 'Average response time', Math.round(this.orchestrator.avgResponseTime * 100) / 100);
        const fontSize = 30;
        this.canvas.drawText({
            position: {
                x: w / 2 + 68,
                y: h / 2 + 50
            },
            text: 'Popularity:',
            fontSize,
            align: 'end',
            color: this.color
        });
        this.canvas.drawText({
            position: {
                x: w / 2 + 75,
                y: h / 2 + 50
            },
            text: this.popularity.popularity.toString(),
            fontSize,
            align: 'start',
            color: this.color
        });
        this.canvas.drawLine({
            from: {
                x: w / 2 - 130,
                y: h / 2 + 20
            },
            to: {
                x: w / 2 + 130,
                y: h / 2 + 20
            },
            color: Defaults.accentColor
        });
    }
    update() { }
    drawStat(y, text, value) {
        this.drawStatTitle(y, text);
        this.drawStatValue(y, value);
    }
    drawStatTitle(y, text) {
        const x = this.canvas.width / 2 + 80;
        this.canvas.drawText({
            position: {
                x,
                y
            },
            text: text + ':',
            fontSize: 15,
            align: 'end',
            color: this.color
        });
    }
    drawStatValue(y, value) {
        const x = this.canvas.width / 2 + 90;
        this.canvas.drawText({
            position: {
                x,
                y
            },
            text: value.toString(),
            fontSize: 15,
            align: 'start',
            color: this.color
        });
    }
}
class TutorialStep {
    texts;
    hasNext = false;
    hasHome = false;
    advance = false;
    advanceOnSpace = false;
    extraButtons = [];
    constructor(texts) {
        this.texts = texts;
    }
    setup() { }
    update() { }
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
    currentStepIndex;
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
        this.currentStepIndex = 0;
        this.nextButton = Utilities.defaultButton({
            x: w / 3,
            y: h - 40
        }, 'Next', () => this.advance());
        this.homeButton = Utilities.defaultButton({
            x: w * 2 / 3,
            y: h - 40
        }, 'Exit tutorial', () => game.switchMode(Defaults.gameModes.MENU));
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
    draw() {
        const w = this.canvas.width, h = this.canvas.height, texts = this.currentStep.texts, rectangle = {
            width: w,
            height: 80,
            color: Defaults.backgroundColor,
            borderColor: Defaults.backgroundBorderColor
        };
        this.canvas.clear();
        this.gameArea.draw();
        this.fader.draw();
        this.canvas.drawRect({
            position: {
                x: w / 2,
                y: 40
            },
            ...rectangle
        });
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            this.canvas.drawText({
                position: {
                    x: w / 2,
                    y: 18 + 20 * i
                },
                text,
                fontWeight: 'bold',
                fontSize: 18,
                align: 'center',
                color: Defaults.primaryColor
            });
        }
        this.canvas.drawRect({
            position: {
                x: w / 2,
                y: h - 40
            },
            ...rectangle
        });
        this.currentStep.draw();
    }
    update() {
        this.currentStep.update();
        this.fader.update(1 / Defaults.frameRate);
        if (this.currentStep.advance) {
            this.advance();
        }
    }
    reset() {
        this.game.reset();
        this.orchestrator.reset();
        this.fader.emptyQueues();
        this.currentStepIndex = 0;
        this.currentStep = this.steps[0];
        this.currentStep.setup();
        this.game.switchMode(Defaults.gameModes.TUTORIAL);
    }
    advance() {
        this.currentStepIndex += 1;
        this.currentStep = this.steps[this.currentStepIndex];
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
            Utilities.defaultButton({ x: w / 2, y: h / 2 }, 'Tutorial', () => tutorial.reset()),
            Utilities.defaultButton({ x: w / 2, y: h / 2 + 60 }, 'New Game', () => newGame.execute()),
            Utilities.defaultButton({ x: w / 2, y: h / 2 + 120 }, 'Credits', () => game.switchMode(Defaults.gameModes.CREDITS)),
            ui.volumeButton
        ];
    }
    getButtons() {
        return this.buttons;
    }
    draw() {
        const w = this.canvas.width, align = 'center', color = Defaults.primaryColorTransparent;
        this.clouds.draw();
        this.canvas.drawRect({
            position: {
                x: w / 2,
                y: 140
            },
            width: w,
            height: 180,
            color: Defaults.secondaryColorTransparent,
            borderColor: Defaults.primaryColorMutedTransparent
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 110
            },
            text: 'Load Balancing',
            fontVariant: 'small-caps',
            fontWeight: 'bold',
            fontSize: 110,
            align,
            color
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 185
            },
            text: 'The Game',
            fontSize: 45,
            align,
            color
        });
        this.canvas.drawLine({
            from: {
                x: 120,
                y: 160
            },
            to: {
                x: w - 118,
                y: 160
            },
            color: Defaults.accentColor,
            width: 2
        });
    }
    update() { }
}
class UpgradeButton {
    position;
    text;
    width;
    height;
    constructor(position, text, onClick) {
        this.position = position;
        this.text = text;
        this.width = 100;
        this.height = 100;
        if (onClick) {
            this.onClick = onClick;
        }
    }
    onClick() { }
    draw(hovered, canvas) {
        canvas.drawRect({
            position: this.position,
            width: this.width,
            height: this.height,
            color: Defaults.secondaryColor,
            borderColor: hovered ? Defaults.primaryColor : undefined,
            borderWidth: 2
        });
        this.drawIcon(canvas);
        if (hovered) {
            canvas.drawText({
                position: {
                    x: canvas.width / 2,
                    y: canvas.height - 50
                },
                text: this.text,
                fontSize: 20,
                align: 'center',
                color: Defaults.accentColor
            });
        }
    }
}
class CapacityUpgradeButton extends UpgradeButton {
    constructor(position, onClick) {
        super(position, 'Scale off at one location', onClick);
    }
    drawIcon(canvas) {
        const p = this.position, serverSize = Defaults.serverSize;
        var queueX = p.x + serverSize / 2 - 7, queueY = p.y + 1, color = Defaults.accentColor, lineWidth = 3;
        Utilities.drawServer(new Server(p), {
            ...Defaults.serverDisabledDefaults,
            queueColor: Defaults.accentColorMuted,
            queueBorderColor: Defaults.accentColor
        }, canvas);
        canvas.drawArrow({
            from: {
                x: queueX,
                y: queueY - serverSize / 2 + 2
            },
            to: {
                x: queueX,
                y: queueY - serverSize / 2 - 13
            },
            color,
            width: lineWidth
        });
    }
}
class ServerUpgradeButton extends UpgradeButton {
    constructor(position, onClick) {
        super(position, 'Buy new datacenter', onClick);
    }
    drawIcon(canvas) {
        const p = this.position;
        canvas.drawText({
            position: {
                x: p.x - 25,
                y: p.y
            },
            text: '+',
            fontSize: 45,
            align: 'center',
            color: Defaults.accentColor
        });
        Utilities.drawServer(new Server({
            x: p.x + 15,
            y: p.y
        }), {
            ...Defaults.serverDisabledDefaults,
            borderColor: Defaults.accentColor
        }, canvas);
    }
}
class SpeedUpgradeButton extends UpgradeButton {
    constructor(position, onClick) {
        super(position, 'Improve speed at one location', onClick);
    }
    drawIcon(canvas) {
        const p = this.position, serverSize = Defaults.serverSize;
        var starX = p.x - serverSize / 2 + 7, starY = p.y + serverSize / 2 - 9, color = Defaults.accentColor, lineWidth = 3;
        Utilities.drawServer(new Server(p), {
            ...Defaults.serverDisabledDefaults,
            speedColor: Defaults.accentColorMuted,
            speedBorderColor: Defaults.accentColor
        }, canvas);
        canvas.drawArrow({
            from: {
                x: starX,
                y: starY - 6
            },
            to: {
                x: starX,
                y: starY - 21
            },
            color,
            width: lineWidth
        });
    }
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
        const w = canvas.width, h = this.canvas.height, y = h / 2 + 150;
        this.buttons = [
            Utilities.defaultButton({ x: w / 2, y: 150 }, 'Continue', () => game.switchMode(Defaults.gameModes.GAME)),
            Utilities.defaultButton({ x: w / 2, y: 210 }, 'New game', () => newGame.execute()),
            Utilities.defaultButton({ x: w / 2, y: 270 }, 'Abandon', () => game.switchMode(Defaults.gameModes.MENU)),
            ui.volumeButton
        ];
        this.upgradeButtons = [
            new ServerUpgradeButton({ x: 250, y }, () => this.selectUpgrade('server')),
            new CapacityUpgradeButton({ x: w / 2, y }, () => this.selectUpgrade('capacity')),
            new SpeedUpgradeButton({ x: w - 250, y }, () => this.selectUpgrade('speed'))
        ];
    }
    getButtons() {
        return this.upgradesTracker.upgradesAvailable > 0
            ? [...this.buttons, ...this.upgradeButtons]
            : [...this.buttons];
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height, x = w / 2, fontSize = 25;
        this.clouds.draw();
        if (this.upgradesTracker.upgradesAvailable > 0) {
            this.canvas.drawText({
                position: {
                    x,
                    y: h / 2 + 60
                },
                text: 'Choose an upgrade:',
                fontSize,
                align: 'center',
                color: Defaults.secondaryColor
            });
        }
        else {
            this.canvas.drawText({
                position: {
                    x,
                    y: h / 2 + 60
                },
                text: 'No upgrades available',
                fontSize,
                align: 'center',
                color: Defaults.primaryColorMuted
            });
        }
        this.canvas.drawText({
            position: {
                x,
                y: 60
            },
            text: '~ Paused ~',
            fontSize: 50,
            align: 'center',
            color: Defaults.accentColor
        });
    }
    update() { }
    selectUpgrade(id) {
        this.upgradesTracker.selectedUpgrade = id;
        this.game.switchMode(Defaults.gameModes.UPGRADE);
    }
}
class ClientExplanation extends TutorialStep {
    canvas;
    clientFactory;
    constructor(canvas, clientFactory) {
        super([
            'This is a CLIENT.',
            'It wants to exchange data with your datacenter.',
            'Your job will be to connect the clients to a datacenter.'
        ]);
        this.canvas = canvas;
        this.clientFactory = clientFactory;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, client = this.clientFactory.create({ x: w * 3 / 4, y: h / 2 }, 10000);
        client.life = -31;
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height, position = {
            x: w * 3 / 4,
            y: h / 2
        };
        Utilities.drawCircleHighlight(position, Defaults.clientSize + 9, this.canvas);
        this.canvas.drawCircle({
            position,
            radius: Defaults.clientSize / 2,
            color: 'gray'
        });
    }
}
class TutorialHelper {
    static drawLegend(canvas, includeNACK) {
        const w = canvas.width, x = w - 120, y = 100, iconRadius = 3, textSpacing = 2, lineSpacing = iconRadius + 5, text = {
            position: {
                x: x + textSpacing + iconRadius,
                y
            },
            fontSize: 10,
            fontFamily: 'sans-serif'
        };
        canvas.drawCircle({
            position: { x, y },
            radius: iconRadius,
            color: Defaults.messageReqColor,
            borderColor: Defaults.messageReqBorderColor
        });
        canvas.drawText({
            position: {
                x: x + textSpacing + iconRadius,
                y
            },
            fontSize: 10,
            fontFamily: 'sans-serif',
            text: ': Request'
        });
        canvas.drawCircle({
            position: { x, y: y + lineSpacing },
            radius: iconRadius,
            color: Defaults.messageAckColor,
            borderColor: Defaults.messageAckBorderColor
        });
        canvas.drawText({
            position: {
                x: x + textSpacing + iconRadius,
                y: y + lineSpacing
            },
            fontSize: 10,
            fontFamily: 'sans-serif',
            text: ': Response (+1)'
        });
        if (includeNACK) {
            canvas.drawCircle({
                position: { x, y: y + lineSpacing * 2 },
                radius: iconRadius,
                color: Defaults.messageNackColor,
                borderColor: Defaults.messageNackBorderColor
            });
            canvas.drawText({
                position: {
                    x: x + textSpacing + iconRadius,
                    y: y + lineSpacing * 2
                },
                fontSize: 10,
                fontFamily: 'sans-serif',
                text: ': Datacenter busy (-1)'
            });
        }
    }
}
class ClientSuccessExplanation extends TutorialStep {
    canvas;
    game;
    orchestrator;
    popularityTracker;
    constructor(canvas, game, orchestrator, popularityTracker) {
        super([
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
    update() {
        if (this.game.clients.length === 0) {
            this.hasNext = true;
        }
        this.game.update();
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height, serverSize = Defaults.serverSize, position = {
            x: w / 2 - serverSize / 2 + 7,
            y: h / 2 + serverSize / 4
        };
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawCircleHighlight(position, 15, this.canvas);
    }
}
class ConnectionExplanation extends TutorialStep {
    game;
    constructor(game) {
        super([
            'To create a connection, click on the client and then on the datacenter.',
            'Be quick though! Clients don\'t like waiting!',
            'Create a CONNECTION to continue.'
        ]);
        this.game = game;
        this.hasHome = true;
    }
    update() {
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
class ConnectMoreClients extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    clientFactory;
    constructor(canvas, game, popularityTracker, clientFactory) {
        super([
            'Cool! Two new clients want to use your service!',
            'Connect them as well to start gaining some more popularity.',
            'Remember, if you wait too much, you will lose popularity!'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        this.clientFactory = clientFactory;
        this.hasHome = true;
    }
    setup() {
        this.spawnClients();
    }
    update() {
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
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);
    }
    spawnClients() {
        const w = this.canvas.width, h = this.canvas.height, client1 = this.clientFactory.create({ x: w / 4, y: h / 4 }, 10000), client2 = this.clientFactory.create({ x: w / 4, y: h * 3 / 4 }, 10000);
        client1.life = -21;
        client2.life = -21;
    }
}
class ConnectToNewServer extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    clientFactory;
    constructor(canvas, game, popularityTracker, clientFactory) {
        super([
            'Perfect! Now you have a new datacenter at your disposal.',
            'This is when a good load balancing strategy will start to matter.',
            'Indeed you would be wiser to connect the clients to the new datacenter.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        this.clientFactory = clientFactory;
        this.hasHome = true;
    }
    setup() {
        this.game.clients[0].life = -21;
        this.game.clients[1].life = -21;
    }
    update() {
        if (this.game.clients.length === 0) {
            const w = this.canvas.width, h = this.canvas.height, client0 = this.clientFactory.create({ x: w / 4, y: h / 3 }, 10000), client1 = this.clientFactory.create({ x: w * 3 / 4, y: h / 3 }, 10000);
            client0.life = -21;
            client1.life = -21;
        }
        if (this.game.clients[0].connectedTo !== undefined && this.game.clients[1].connectedTo !== undefined) {
            this.advance = true;
        }
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}
class DdosAttackExample extends TutorialStep {
    canvas;
    game;
    fader;
    clientFactory;
    attackerFactory;
    constructor(canvas, game, fader, clientFactory, attackerFactory) {
        super([
            'Oh snap! Your datacenter is under a DDOS ATTACK! And more clients need serving!',
            'This is likely to happen as you get more and more popular.',
            'You\'d better upgrade once again to cope with this situation.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.fader = fader;
        this.clientFactory = clientFactory;
        this.attackerFactory = attackerFactory;
        this.hasHome = true;
        this.advanceOnSpace = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, server = this.game.servers[0], text = {
            position: {
                x: w / 2,
                y: h - 116
            },
            fontSize: 20,
            rgbColor: { r: 255, g: 0, b: 0 },
            id: 'upgradeTut',
            text: '- Upgrade available! -',
            life: 1000,
            alpha: 0,
            delta: 0
        };
        this.attackerFactory.create({ x: w / 2, y: h * 3 / 4 }, 10000, server);
        this.attackerFactory.create({ x: w / 3, y: h * 2 / 3 }, 10000, server);
        this.attackerFactory.create({ x: w * 2 / 3, y: h * 2 / 3 }, 10000, server);
        this.spawnClients();
        this.fader.addPermanentText(text);
    }
    update() {
        if (this.game.selectedClient) {
            this.game.selectedClient = undefined;
        }
        if (this.game.clients.length === 0) {
            this.spawnClients();
        }
        this.game.update();
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height;
        TutorialHelper.drawLegend(this.canvas, true);
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h - 95
            },
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            color: Defaults.secondaryColorMuted
        });
    }
    spawnClients() {
        const w = this.canvas.width, h = this.canvas.height, client0 = this.clientFactory.create({ x: w / 4, y: h / 3 }, 10000), client1 = this.clientFactory.create({ x: w * 3 / 4, y: h / 3 }, 10000);
        client0.life = -21;
        client1.life = -21;
    }
}
class NewServerUpgradeExample extends TutorialStep {
    canvas;
    fader;
    constructor(canvas, serverFactory, fader) {
        super([
            'This time let\'s buy a new datacenter.',
            'This way you can connect the clients to it while your first one is under attack.',
            'Select the first upgrade (Buy new datacenter).'
        ]);
        this.canvas = canvas;
        this.fader = fader;
        const w = canvas.width, h = canvas.height, y = h / 2 + 150;
        this.extraButtons = [
            new ServerUpgradeButton({
                x: 250,
                y
            }, () => {
                const server = serverFactory.create({ x: w / 2, y: h / 4 });
                server.capacity = 20;
                this.advance = true;
            }),
            new CapacityUpgradeButton({ x: w / 2, y }),
            new SpeedUpgradeButton({ x: w - 250, y })
        ];
    }
    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height;
        this.canvas.drawRect({
            position: this.canvas.center,
            width: w,
            height: h - 158,
            color: Defaults.backgroundColor
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h / 2 + 60
            },
            text: 'Choose an upgrade:',
            fontSize: 25,
            align: 'center',
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h / 3
            },
            text: '~ Paused ~',
            fontSize: 50,
            align: 'center',
            color: Defaults.accentColor
        });
    }
}
class PopularityExplanation extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    constructor(canvas, game, popularityTracker) {
        super([
            'Good job! Now your very first client is being served.',
            'You can see the REQUESTS and RESPONSES traveling along the connection.',
            'The POPULARITY measures how successful your service is being.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        this.popularityTracker.popularity = 0;
    }
    update() {
        this.game.update();
    }
    draw() {
        const h = this.canvas.height, position = {
            x: 70,
            y: h - 95
        };
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, false);
        Utilities.drawCircleHighlight(position, 67, this.canvas);
    }
}
class ServerBusyExample extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    constructor(canvas, game, popularityTracker) {
        super([
            'Oh no! Looks like your datacenter can\'t handle all this traffic!',
            'Clients will not be pleased if your datacenter is too busy to reply.',
            'You can see how busy a datacenter is by looking at its status bar.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        this.hasNext = true;
        this.hasHome = true;
    }
    update() {
        this.game.update();
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height, serverSize = Defaults.serverSize, position = {
            x: w / 2 + serverSize / 2 - 7,
            y: h / 2 + 1
        };
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        Utilities.drawCircleHighlight(position, serverSize / 2, this.canvas);
    }
}
class ServerExplanation extends TutorialStep {
    canvas;
    constructor(canvas) {
        super([
            'This is a DATACENTER.',
            'Its role is to send data to your clients.',
            'Click "Next" to continue.'
        ]);
        this.canvas = canvas;
        this.hasNext = true;
        this.hasHome = true;
    }
    draw() {
        Utilities.drawCircleHighlight(this.canvas.center, Defaults.serverSize + 9, this.canvas);
    }
}
class SpeedUpgradeExample extends TutorialStep {
    canvas;
    game;
    fader;
    constructor(canvas, game, fader) {
        super([
            'Let\'s improve your datacenter\'s speed.',
            'This way it will process the clients\' requests faster.',
            'Select the third upgrade (Improve speed at one location).'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.fader = fader;
        const w = canvas.width, h = canvas.height, y = h / 2 + 150;
        this.extraButtons = [
            new ServerUpgradeButton({ x: 250, y }),
            new CapacityUpgradeButton({ x: w / 2, y }),
            new SpeedUpgradeButton({
                x: w - 250,
                y
            }, () => {
                this.game.servers[0].speed += Defaults.serverSpeed;
                this.advance = true;
            })
        ];
    }
    setup() {
        this.fader.removeFromPermanentQueue('upgradeTut');
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height;
        this.canvas.drawRect({
            position: this.canvas.center,
            width: w,
            height: h - 158,
            color: Defaults.backgroundColor
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h / 2 + 60
            },
            text: 'Choose an upgrade:',
            fontSize: 25,
            align: 'center',
        });
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h / 3
            },
            text: '~ Paused ~',
            fontSize: 50,
            align: 'center',
            color: Defaults.accentColor
        });
    }
}
class TutorialFinished extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    constructor(canvas, game, popularityTracker, newGame) {
        super([
            'Excellent! By now you should know all the basics.',
            'This tutorial is finished.',
            'You can start a new game or go back to the main menu.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        const w = canvas.width, h = canvas.height;
        this.hasHome = true;
        this.extraButtons = [
            Utilities.defaultButton({
                x: w / 3,
                y: h - 40
            }, 'New game', () => newGame.execute())
        ];
    }
    update() {
        this.game.update();
    }
    draw() {
        const h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
    }
}
class UpgradesIntroduction extends TutorialStep {
    canvas;
    game;
    popularityTracker;
    fader;
    constructor(canvas, game, popularityTracker, fader) {
        super([
            'Thankfully, you are popular enough to afford to UPGRADE your datacenter.',
            'As your popularity grows, you will be able to upgrade it even more.',
            'Press SPACE to pause the game and select an upgrade.'
        ]);
        this.canvas = canvas;
        this.game = game;
        this.popularityTracker = popularityTracker;
        this.fader = fader;
        this.hasHome = true;
        this.advanceOnSpace = true;
    }
    setup() {
        const w = this.canvas.width, h = this.canvas.height, text = {
            position: {
                x: w / 2,
                y: h - 116
            },
            fontSize: 20,
            rgbColor: { r: 255, g: 0, b: 0 },
            id: 'upgradeTut',
            text: '- Upgrade available! -',
            life: 1000,
            alpha: 0,
            delta: 0
        };
        this.fader.addPermanentText(text);
    }
    update() {
        this.game.update();
    }
    draw() {
        const w = this.canvas.width, h = this.canvas.height;
        this.popularityTracker.draw(h - 95);
        TutorialHelper.drawLegend(this.canvas, true);
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: h - 95
            },
            text: 'Press space to pause',
            fontSize: 18,
            fontFamily: 'sans-serif',
            align: 'center',
            color: Defaults.secondaryColorMuted
        });
    }
}
class Welcome extends TutorialStep {
    canvas;
    serverFactory;
    constructor(canvas, serverFactory) {
        super([
            'Welcome to Load Balancing: The Game!',
            'Here you will take the role of -you guessed it- a LOAD BALANCER.',
            'Click "Next" to start the tutorial.'
        ]);
        this.canvas = canvas;
        this.serverFactory = serverFactory;
        this.hasNext = true;
        this.hasHome = true;
    }
    setup() {
        const server = this.serverFactory.create(this.canvas.center);
        server.capacity = 20;
    }
}
class BorderButton {
    position;
    width;
    height;
    color;
    hoverColor;
    borderWidth;
    onClick;
    constructor(position, width, height, color, hoverColor, borderWidth, onClick) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.hoverColor = hoverColor;
        this.borderWidth = borderWidth;
        this.onClick = onClick;
    }
    draw(hovered, canvas) {
        const color = hovered ? this.hoverColor : this.color;
        canvas.drawRect({
            position: this.position,
            width: this.width,
            height: this.height,
            borderColor: color,
            borderWidth: this.borderWidth
        });
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
        const w = this.canvas.width, h = this.canvas.height, button = Utilities.defaultButton({ x: w / 2, y: h - 100 }, 'Cancel', () => this.game.switchMode(Defaults.gameModes.PAUSE));
        button.color = Defaults.secondaryColor;
        let buttons = [button];
        switch (this.upgradesTracker.selectedUpgrade) {
            case 'speed':
                buttons = [...buttons, ...this.createServerButtons(s => s.speed += 2)];
                break;
            case 'capacity':
                buttons = [...buttons, ...this.createServerButtons(s => s.capacity += Defaults.serverCapacity)];
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
    draw() {
        const w = this.canvas.width;
        this.canvas.clear();
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
        this.canvas.drawText({
            position: {
                x: w / 2,
                y: 60
            },
            text: `~ Select ${text} ~`,
            fontSize: 30,
            align: 'center',
            color: Defaults.accentColor
        });
    }
    update() { }
    createAreaButton(x, y, area) {
        const w = this.canvas.width, h = this.canvas.height, borderWidth = Defaults.highlightWidth;
        return new BorderButton({ x, y }, Math.floor(w / 3) - borderWidth, Math.floor(h / 3) - borderWidth, 'transparent', Defaults.highlightColor, borderWidth, () => {
            this.scheduler.createServer(area);
            this.selectUpgrade();
        });
    }
    createServerButton(server, action) {
        const borderWidth = Defaults.highlightWidth, size = Defaults.serverSize + borderWidth;
        return new BorderButton(server.position, size, size, 'transparent', Defaults.highlightColor, borderWidth, () => {
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
        let l = document.getElementById('fps');
        if (!l) {
            const log = document.getElementById('log');
            if (log) {
                log.innerHTML = 'Fps: <span id="fps"></span><br />' + log.innerHTML;
            }
            l = document.getElementById('fps');
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
        clouds.setSkyColor(Defaults.backgroundColor);
        this.createCloud(w / 4, h / 4);
        this.createCloud(0 - w / 4, h / 3);
        this.createCloud(w / 2, h / 2);
        this.createCloud(0 - w / 2, h * 3 / 4);
        this.createCloud(w * 3 / 4, h * 2 / 3);
        this.createCloud(0 - w * 3 / 4, h / 2);
        document.addEventListener('keypress', e => this.keyboardHandler(e));
        window.addEventListener('blur', () => this.blurHandler());
    }
    static build(clouds) {
        const canvasElement = document.getElementById('canvas');
        const music = new Audio('assets/music.mp3');
        const canvas = new Canvas(canvasElement);
        const fader = new TextFader(canvas);
        const fpsCounter = new FpsCounter();
        const orchestrator = new MessageOrchestrator();
        const upgradesTracker = new UpgradesTracker();
        const popularityTracker = new PopularityTracker(fader, upgradesTracker, canvas);
        const ui = new GameUI(music, canvas);
        const game = new GameTracker(popularityTracker, ui, orchestrator);
        const attackerFactory = new AttackerFactory(game, orchestrator);
        const clientFactory = new ClientFactory(game, orchestrator, popularityTracker);
        const serverFactory = new ServerFactory(game);
        const cursor = new CursorTracker(game, canvasElement, ui);
        const scheduler = new Scheduler(popularityTracker, canvas, game, clientFactory, attackerFactory, serverFactory);
        const gameArea = new GameArea(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader);
        const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, scheduler, fader);
        const credits = new Credits(canvas, clouds, game);
        const gameOver = new GameOver(canvas, clouds, game, orchestrator, popularityTracker, newGame);
        const pause = new Pause(canvas, clouds, game, upgradesTracker, ui, newGame);
        const upgrade = new Upgrade(canvas, game, upgradesTracker, scheduler, gameArea, fader);
        const gameScene = new Game(canvas, game, scheduler, gameArea, fader);
        const tutorial = new Tutorial([
            new Welcome(canvas, serverFactory),
            new ServerExplanation(canvas),
            new ClientExplanation(canvas, clientFactory),
            new ConnectionExplanation(game),
            new PopularityExplanation(canvas, game, popularityTracker),
            new ConnectMoreClients(canvas, game, popularityTracker, clientFactory),
            new ServerBusyExample(canvas, game, popularityTracker),
            new UpgradesIntroduction(canvas, game, popularityTracker, fader),
            new SpeedUpgradeExample(canvas, game, fader),
            new ClientSuccessExplanation(canvas, game, orchestrator, popularityTracker),
            new DdosAttackExample(canvas, game, fader, clientFactory, attackerFactory),
            new NewServerUpgradeExample(canvas, serverFactory, fader),
            new ConnectToNewServer(canvas, game, popularityTracker, clientFactory),
            new TutorialFinished(canvas, game, popularityTracker, newGame)
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
        this.activeScene.draw();
        this.ui.buttons = this.activeScene.getButtons();
        this.drawButtons();
        if (this.logActive) {
            this.fpsCounter.update();
            this.fpsCounter.logFps();
        }
    }
    createCloud(x, y) {
        const w = Utilities.random(350, 500), h = Utilities.random(w, 700), circles = Utilities.random(15, 30), n = Utilities.random(180, 255), color = { r: n, g: n, b: n, a: .1 }, speed = Utilities.random(100, 200);
        this.clouds.add(x, y, w, h, circles, color, speed);
    }
    drawButtons() {
        const mp = this.cursor.mousePosition;
        this.ui.buttons.forEach((button) => {
            const bp = button.position, hovered = mp.x > bp.x - (button.width + 2) / 2 &&
                mp.x < bp.x + (button.width + 2) / 2 &&
                mp.y > bp.y - (button.height + 4) / 2 &&
                mp.y < bp.y + (button.height + 2) / 2;
            button.draw(hovered, this.canvas);
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
