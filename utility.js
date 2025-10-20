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