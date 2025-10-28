var context = document.getElementById('canvas').getContext("2d");

function drawText(x, y, text, font, align, baseline, color) {
	Utilities.drawText(x, y, text, font, align, baseline, color, context)
}

function drawLine(x1, y1, x2, y2, c, w) {
	Utilities.drawLine(x1, y1, x2, y2, c, w, context);
}

function invertColor(color) {
	Utilities.invertColor(color);
}

function drawCircleBorder(x, y, r, c, bw) {
	Utilities.drawCircleBorder(x, y, r, c, bw, context);
}

function drawCircle(x, y, r, c, bc, bw) {
	Utilities.drawCircle(x, y, r, c, bc, bw, context);
}

function drawRectBorder(x, y, w, h, c, bw) {
	Utilities.drawRectBorder(x, y, w, h, c, bw, context);
}

function drawRect(x, y, w, h, c, bc, bw) {
	Utilities.drawRect(x, y, w, h, c, bc, bw, context);
}

function drawTriangleBorder(x, y, b, h, c, bw) {
	Utilities.drawTriangleBorder(x, y, b, h, c, bw, context);
}

function drawTriangle(x, y, b, h, c, bc, bw) {
	Utilities.drawTriangle(x, y, b, h, c, bc, bw, context)
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius, c, bc, bw) {
	Utilities.drawStar(cx, cy, spikes, outerRadius, innerRadius, c, bc, bw, context);
}

function clear() {
	context.clearRect(0, 0, WIDTH, HEIGHT);
}