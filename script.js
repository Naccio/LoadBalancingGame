"use strict";
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
class Utilities {
    static defaultColor = 'black';
    static drawRectBorder(x, y, w, h, c, bw, context) {
        if (!c) {
            c = Utilities.defaultColor;
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
            c = Utilities.defaultColor;
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
