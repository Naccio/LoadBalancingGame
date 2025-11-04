/// <reference path='FadingText.ts' />

class TextFader {
    private queues: {
        temporary: {
            id: string;
            x: number;
            y: number;
            activeTexts: FadingText[];
            queuedTexts: FadingText[];
        }[];
        permanent: FadingText[]
    };

    constructor(private context: CanvasRenderingContext2D) {
        this.queues = { permanent: [], temporary: [] }
    }

    draw() {
        // Normal text
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];
            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                this.drawText(text, queue.x, queue.y);
            }
        }

        // Permanent text
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];
            this.drawText(text, text.x ?? 0, text.y ?? 0);
        }
    };

    update(deltaTime: number) {
        // Normal text
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];

            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                text.delta += 70 * deltaTime;

                if (text.fadeIn) {
                    text.alpha += 0.02/*4 * Math.floor(100 * deltaTime / text.life) / 100*/;
                    if (text.alpha >= 1) {
                        text.fadeIn = false;
                    }
                } else {
                    text.alpha -= 0.02/*Math.floor(100 * deltaTime / text.life) / 100*/;
                    if (text.alpha <= 0) {
                        queue.activeTexts.splice(j--, 1);
                        continue;
                    }
                }
            }

            if (queue.queuedTexts.length > 0) {
                if (queue.activeTexts.length === 0) {
                    queue.activeTexts.push(queue.queuedTexts.shift()!);
                } else if (queue.activeTexts[queue.activeTexts.length - 1].delta > queue.queuedTexts[0].fontSize) {
                    queue.activeTexts.push(queue.queuedTexts.shift()!);
                }
            }
        }


        // Permanent text
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];

            if (text.fadeIn) {
                text.alpha += 0.05/*Math.floor(100 * deltaTime / text.life) / 100*/;
                if (text.alpha >= 1) {
                    text.fadeIn = false;
                }
            } else {
                text.alpha -= 0.05/*Math.floor(100 * deltaTime / text.life) / 100*/;
                if (text.alpha <= 0) {
                    text.fadeIn = true;
                }
            }
        }
    }

    addText(text: FadingText, queueId: string) {
        if (!text.life) {
            text.life = 1000;
        }
        if (text.fadeIn) {
            text.alpha = 0;
        } else {
            text.alpha = 1;
        }
        text.delta = 0;
        text.font = text.fontWeight + ' ' + text.fontSize + 'px Arial';
        this.queues.temporary.find(q => q.id == queueId)?.queuedTexts.push(text);
    };

    addPermanentText(text: FadingText) {
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
    };

    removeFromPermanentQueue(id: string) {
        for (let i = 0; i < this.queues.permanent.length; i++) {
            if (this.queues.permanent[i].id === id) {
                this.queues.permanent.splice(i, 1);
                return;
            }
        }
    };

    createQueue(id: string, x: number, y: number) {
        this.queues.temporary.push({
            id: id,
            x: x,
            y: y,
            activeTexts: [],
            queuedTexts: []
        });
    };

    emptyQueues() {
        this.queues = { permanent: [], temporary: [] };
    };

    private drawText(text: FadingText, x: number, y: number) {
        const delta = text.delta ?? 0,
            { r, g, b } = text.color,
            a = text.alpha,
            color = `rgba(${r}, ${g}, ${b}, ${a})`;

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