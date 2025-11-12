/// <reference path='../Graphics/Canvas.ts' />
/// <reference path='../Model/Point.ts' />
/// <reference path='FadingText.ts' />

class TextFader {
    private queues: {
        temporary: {
            id: string;
            position: Point;
            activeTexts: FadingText[];
            queuedTexts: FadingText[];
        }[];
        permanent: FadingText[]
    };

    constructor(private canvas: Canvas) {
        this.queues = { permanent: [], temporary: [] }
    }

    draw() {
        // Normal text
        for (let i = 0; i < this.queues.temporary.length; i++) {
            const queue = this.queues.temporary[i];
            for (let j = 0; j < queue.activeTexts.length; j++) {
                const text = queue.activeTexts[j];
                this.drawText(text, queue.position);
            }
        }

        // Permanent text
        for (let i = 0; i < this.queues.permanent.length; i += 1) {
            const text = this.queues.permanent[i];
            this.drawText(text, text.position);
        }
    }

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

    addText(text: FadingText) {
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
    }

    removeFromPermanentQueue(id: string) {
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

    private createQueue(position: Point) {
        const queue = {
            id: this.getId(position),
            position: { ...position },
            activeTexts: [],
            queuedTexts: []
        };

        this.queues.temporary.push(queue);

        return queue;
    }

    private drawText(text: FadingText, position: Point) {
        const delta = text.delta ?? 0,
            { r, g, b } = text.rgbColor,
            a = text.alpha,
            color = `rgba(${r}, ${g}, ${b}, ${a})`;

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

    private getId(position: Point) {
        return position.x.toString() + position.y.toString();
    }
}