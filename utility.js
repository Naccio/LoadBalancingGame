var defaultColor = "black",
	context = document.getElementById('canvas').getContext("2d"),
	WIDTH = document.getElementById('canvas').width,
	HEIGHT = document.getElementById('canvas').height;

function drawText(x, y, text, font, align, baseline, color) {
	Utilities.drawText(x, y, text, font, align, baseline, color, context)
}

function drawLine(x1, y1, x2, y2, c, w) {
	Utilities.drawLine(x1, y1, x2, y2, c, w, context);
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
	Utilities.drawStar(cx, cy, spikes, outerRadius, innerRadius, c, bc, bw, context);
}

function clear() {
	context.clearRect(0, 0, WIDTH, HEIGHT);
}

function log(s) {
	document.getElementById("log").innerHTML += s + "<br>";
}