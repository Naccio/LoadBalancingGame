var defaultColor = "black",
	context = document.getElementById('canvas').getContext("2d"),
	WIDTH = document.getElementById('canvas').width,
	HEIGHT = document.getElementById('canvas').height;

function drawText(x, y, text, font, align, baseline, color) {
	Utilities.drawText(x, y, text, font, align, baseline, color, context)
}

function drawLine(x1, y1, x2, y2, c, w) {
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

function invertColor(color) {
	Utilities.invertColor(color);
}

// x, y = center
function drawCircleBorder(x, y, r, c, bw) {
	if (!c) {
		c = defaultColor;
	}
	if (!bw) {
		bw = 1;
	}
	context.strokeStyle = c;
	context.lineWidth = bw;
	context.beginPath();
	context.arc(x, y, r, 0, Math.PI * 2, true);
	context.closePath();
	context.stroke();
}

function drawCircle(x, y, r, c, bc, bw) {
	if (!c) {
		c = defaultColor;
	}
	if (bc) {
		drawCircleBorder(x, y, r, bc, bw);
	}
	context.fillStyle = c;
	context.beginPath();
	context.arc(x, y, r, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

// x, y = center
function drawRectBorder(x, y, w, h, c, bw) {
	Utilities.drawRectBorder(x, y, w, h, c, bw, context);
}

// x, y = center
function drawRect(x, y, w, h, c, bc, bw) {
	Utilities.drawRect(x, y, w, h, c, bc, bw, context);
}

// x, y = center
function drawTriangleBorder(x, y, b, h, c, bw) {
	if (!c) {
		c = defaultColor;
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

// x, y = center
function drawTriangle(x, y, b, h, c, bc, bw) {
	if (!c) {
		c = defaultColor;
	}
	if (bc) {
		drawTriangleBorder(x, y, b, h, bc, bw);
	}
	var path = new Path2D();
	path.moveTo(x, y - h / 2);
	path.lineTo(x + b / 2, y + h / 2);
	path.lineTo(x - b / 2, y + h / 2);
	context.fillStyle = c;
	context.fill(path);
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius, c, bc, bw) {
	var rot = Math.PI / 2 * 3,
		x = cx,
		y = cy,
		step = Math.PI / spikes,
		i;

	context.beginPath();
	context.moveTo(cx, cy - outerRadius);
	for (i = 0; i < spikes; i += 1) {
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

function clear() {
	context.clearRect(0, 0, WIDTH, HEIGHT);
}

function getDistance(x1, y1, x2, y2) {
	var xs = x2 - x1,
		ys = y2 - y1;

	return Math.sqrt(Math.pow(xs, 2) + Math.pow(ys, 2));
}

function log(s) {
	document.getElementById("log").innerHTML += s + "<br>";
}


// CLASSES

function TextFader() {
	var queues = { permanent: [] }, lastDraw = Date.now();

	this.draw = function draw() {
		var i, j, queue, text, color;

		// Normal text
		for (i in queues) {
			if (queues.hasOwnProperty(i) && i != "permanent") {
				queue = queues[i];
				for (j = 0; j < queue.activeTexts.length; j++) {
					text = queue.activeTexts[j];
					color = "rgba(" + text.color.r + ", " + text.color.g + ", " + text.color.b + ", " + text.alpha + ")";
					drawText(queue.x, queue.y - text.delta, text.text, text.font, "center", "middle", color);
				}
			}
		}


		// Permanent text
		for (i = 0; i < queues.permanent.length; i += 1) {
			text = queues.permanent[i];
			color = "rgba(" + text.color.r + ", " + text.color.g + ", " + text.color.b + ", " + text.alpha + ")";
			drawText(text.x, text.y, text.text, text.font, "center", "middle", color);
		}
	};

	this.update = function update(deltaTime) {
		var i, queue, text, logged;

		// Normal text
		for (i in queues) {
			if (queues.hasOwnProperty(i) && i != "permanent") {
				queue = queues[i];
				if (!logged) {
					logged = i;
				}
				if (logged === i && (queue.activeTexts.length > 0 || queue.queuedTexts.length > 0)) {
					//log(i + " - Active: " + queue.activeTexts.length + " Queued: " + queue.queuedTexts.length);
				}
				for (j = 0; j < queue.activeTexts.length; j++) {
					text = queue.activeTexts[j];
					text.delta += 70 * deltaTime;

					if (text.fadeIn) {
						text.alpha += 0.02/*4 * Math.floor(100 * deltaTime / text.life) / 100*/;
						if (text.alpha >= 1) {
							text.fadeIn = false;
						}
					} else {
						text.alpha -= 0.02/*Math.floor(100 * deltaTime / text.life) / 100*/;
						if (text.alpha <= 0) {
							queue.activeTexts.splice(i--, 1);
							continue;
						}
					}
				}

				if (queue.queuedTexts.length > 0) {
					if (queue.activeTexts.length === 0) {
						queue.activeTexts.push(queue.queuedTexts.shift());
						//alert("Active due to emptiness");
					} else if (queue.activeTexts[queue.activeTexts.length - 1].delta > queue.queuedTexts[0].fontSize) {
						//alert("Active due to space (" + queue.activeTexts[queue.activeTexts.length - 1].delta + ")");
						queue.activeTexts.push(queue.queuedTexts.shift());
					}
				}
			}
		}


		// Permanent text
		for (i = 0; i < queues.permanent.length; i += 1) {
			text = queues.permanent[i];

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

	this.addText = function addText(text, queueId) {
		if (!text.life) {
			text.life = 1000;
		}
		if (text.fadeIn) {
			text.alpha = 0;
		} else {
			text.alpha = 1;
		}
		text.delta = 0;
		text.font = text.fontWeight + " " + text.fontSize + "px Arial";
		queues[queueId].queuedTexts.push(text);
	};

	this.addPermanentText = function addPermanentText(text) {
		var i;
		for (i = 0; i < queues.permanent.length; i += 1) {
			if (queues.permanent[i].id === text.id) {
				return;
			}
		}
		if (!text.life) {
			text.life = 1000;
		}
		text.alpha = 0;
		text.fadeIn = true;
		queues.permanent.push(text);
	};

	this.removeFromPermanentQueue = function removeFromPermanentQueue(id) {
		var i;
		for (i = 0; i < queues.permanent.length; i += 1) {
			if (queues.permanent[i].id === id) {
				queues.permanent.splice(i, 1);
				return;
			}
		}
	};

	this.createQueue = function createQueue(id, x, y) {
		queues[id] = {
			id: id,
			x: x,
			y: y,
			activeTexts: [],
			queuedTexts: []
		}
	};

	this.emptyQueues = function emptyQueues() {
		queues = { permanent: [] };
	};
}

function FpsCounter() {
	var lastTimestamp = Date.now(),
		fps;

	this.update = function update() {
		var currentTimestamp = Date.now(),
			diff = (currentTimestamp - lastTimestamp) / 1000;
		fps = Math.floor(1 / diff);
		lastTimestamp = currentTimestamp;
	};

	this.logFps = function logFps() {
		var l = document.getElementById("fps");
		if (!l) {
			document.getElementById("log").innerHTML = 'Fps: <span id="fps"></span><br />' + document.getElementById("log").innerHTML;
			l = document.getElementById("fps");
		}
		l.innerHTML = fps;
	};
}