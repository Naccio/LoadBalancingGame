/*

LOAD BALANCING: THE GAME
Author: Naccio

This game was first created with Treestle (www.treestle.com) to showcase the difficulties of traffic management and load balancing.
I further developed it during a project for my Master's degree and I keep on adding stuff whenever I have ideas and time.
This is the first JavaScript project I made that went beyond plain DOM manipulation and my very first time using canvas.
The code might thus look a bit wonky, with different styles mixed together and whatnot, but I was learning and experimenting.
And I haven't had time to do a complete refactoring yet.

*/

//construction stuff
var WIDTH;
var HEIGHT;
var context;
var canvas;
var mouseX;
var mouseY;

//constants
var serverSize = 40;	//pixels (side)
var clientSize = 30;	//pixels (diameter)
var messageSize = 6;	//pixels (diameter)
var frameRate = 60;		//frames per second
var messageVelocity = 200;	//pixels per second
var maxClientWaitTime = 9;	//seconds
var clientsSpeed = 2;	//messages per second
var serversSpeed = 3.5;	//messages per second
var serversCapacity = 80; //messages
var gameModes = { MENU: 0, GAME: 1, GAMEOVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
var upgrades = [100, 200, 300, 500, 700, 1000, 1300, 1700, 2100, 2600, 3100, 3700, 4300, 5000];
var startTime = new Date().getTime();
var gameLength = 5; //minutes

//variables
var servers = [];
var clients = [];
var attackers = [];
var messages = [];
var buttons = [];
var messageQueue = [];
var selectedClient = null;
var currentGameMode;
var clientsServed = 0;
var droppedConnections = 0;
var failedConnections = 0;
var avgResponseTime = 0;
var totalAcks = 0;
var popularity = 0;
var elapsedTime;
var upgradesAvailable = 0;
var nextUpgrade = 0;
var selectedUpgrade = null;

//helpers
var sched;
var fader;
var fpsCounter;
var music;

var logActive = false;

var volumeButton = new SpecialButton(WIDTH - 40, HEIGHT - 30, 20, 20, "rgba(0,0,0,0)", "rgba(0,0,0,0)", 0, function () {
	if (music.paused) {
		music.play();
	} else {
		music.pause();
	}
}, function (hovered) {
	var clr = "rgba(255,255,255,0.8)",
		status = "On";
	if (hovered) {
		clr = "#FFFFFF";
	}
	drawRect(this.x - this.width / 4 + 1, this.y, this.width / 4 + 1, this.height / 2 - 1, clr);
	var path = new Path2D();
	path.moveTo(this.x - 1, this.y - this.height / 4);
	path.lineTo(this.x + this.width / 4, this.y - this.height / 2 + 1);
	path.lineTo(this.x + this.width / 4, this.y + this.height / 2 - 1);
	path.lineTo(this.x - 1, this.y + this.height / 4);
	path.closePath();
	context.fillStyle = clr;
	context.fill(path);

	if (music.paused) {
		drawLine(this.x - this.width / 2, this.y + this.height / 2, this.x + this.width / 2, this.y - this.height / 2, "red", 2);
		status = "Off";
	}
	if (hovered) {
		drawText(this.x, this.y + this.width / 2 + 2, "Music: " + status, "10px monospace", "center", "top", "#fff");
	}
});


//classes
function Message(sender, receiver) {
	this.x = sender.x;
	this.y = sender.y;
	this.sender = sender;
	this.receiver = receiver;
	this.status = "req";
	this.life = 0;

	this.computeVelocity = function computeVelocity() {
		var xDiff = this.receiver.x - this.x,
			yDiff = this.receiver.y - this.y,
			angle = Math.atan2(yDiff, xDiff),
			v = messageVelocity / frameRate;
		this.dx = Math.cos(angle) * v;
		this.dy = Math.sin(angle) * v;
	};

	this.computeVelocity();

	this.move = function move() {
		this.x += this.dx;
		this.y += this.dy;
	};

	this.invertDirection = function invertDirection() {
		var tmp = this.sender;
		this.sender = this.receiver;
		this.receiver = tmp;
		this.computeVelocity();
	};
}

function Server(x, y) {
	this.x = x;
	this.y = y;
	this.queue = [];
	this.lastMessageTime = 0;
	this.capacity = serversCapacity;
	this.speed = serversSpeed;

	this.sendMessage = function sendMessage() {
		if (this.queue.length > 0) {
			//var index = Math.floor(Math.random() * this.queue.length);
			//var msg = this.queue.splice(index, 1)[0];
			var msg = this.queue.shift();
			msg.status = "ack";
			msg.invertDirection();
			this.lastMessageTime = elapsedTime;
		}
	};

	this.receiveMessage = function receiveMessage(msg) {
		msg.x = this.x;
		msg.y = this.y;

		if (this.queue.length < this.capacity) {
			this.queue.push(msg);
			msg.status = "queued";
		} else {
			msg.status = "nack";
			msg.invertDirection();
		}
	};
}

function Client(x, y, msgNr) {
	this.x = x;
	this.y = y;
	this.life = 0;
	this.connectedTo = null;
	this.lastMessageTime = 0;
	this.messagesToSend = msgNr;
	this.acksToReceive = msgNr;
	this.nacksToDie = Math.floor(msgNr / 3);
	fader.createQueue(x.toString() + y.toString(), x, y - 8 - clientSize / 2);

	this.sendMessage = function sendMessage() {
		var m = new Message(this, this.connectedTo);
		m.computeVelocity();
		messages.push(m);
		this.messagesToSend -= 1;
		this.lastMessageTime = elapsedTime;
	};

	this.receiveMessage = function receiveMessage(msg) {
		var n;
		if (msg.status === "ack") {
			this.acksToReceive -= 1;
			totalAcks += 1;
			n = 1;
			if (this.acksToReceive === 0) {
				n += 5;
			}
			updatePopularity(n, this.x, this.y);
			avgResponseTime = (msg.life + (totalAcks - 1) * avgResponseTime) / totalAcks;
		} else {
			this.nacksToDie -= 1;
			n = -1;
			if (this.nacksToDie > 0) {
				this.messagesToSend += 1;
			} else {
				n -= 5;
			}
			updatePopularity(n, this.x, this.y);
		}

		msg.status = "done";
	};
}

function Attacker(x, y, msgNr, connectedTo) {
	this.x = x;
	this.y = y;
	this.connectedTo = connectedTo;
	this.lastMessageTime = 0;
	this.messagesToSend = msgNr;
	this.messagesToReceive = msgNr;

	this.sendMessage = function sendMessage() {
		var m = new Message(this, this.connectedTo);
		m.computeVelocity();
		messages.push(m);
		this.messagesToSend -= 1;
		this.lastMessageTime = elapsedTime;
	};

	this.receiveMessage = function receiveMessage(msg) {
		msg.status = "done";
		this.messagesToReceive -= 1;
	};
}

function Scheduler() {
	this.timeLastDDoS = 0;
	this.minClientMessages = 25;
	this.maxClientMessages = 35;
	this.attackersMessages = 30;
	this.attackersNumber = 1;
	this.spawnRate = 6;
	this.attackRate = 80;
	this.timeLastClient = 1 - this.spawnRate;

	this.schedule = function schedule() {
		var remaining = gameLength * 60 - elapsedTime;

		if (remaining > maxClientWaitTime) {
			if (elapsedTime - this.timeLastClient > Math.max(this.spawnRate - Math.cbrt(popularity / 40), 1.6) && Math.random() > 0.3) {
				this.createClient();
			}
		}

		if (remaining > 30) {
			if (elapsedTime - this.timeLastDDoS > Math.max(this.attackRate - popularity / 100, 60) && Math.random() > 0.3) {
				this.initiateDDoS();
			}
		}
	};

	this.createServer = function createServer(zone) {
		var x, y, minX, minY, maxX, maxY;

		switch (zone) {
			case "nw":
				minX = serverSize;
				minY = serverSize;
				maxX = WIDTH / 3;
				maxY = HEIGHT / 3;
				break;
			case "n":
				minX = WIDTH / 3;
				minY = serverSize;
				maxX = WIDTH * 2 / 3;
				maxY = HEIGHT / 3;
				break;
			case "ne":
				minX = WIDTH * 2 / 3;
				minY = serverSize;
				maxX = WIDTH - serverSize;
				maxY = HEIGHT / 3;
				break;
			case "w":
				minX = serverSize;
				minY = HEIGHT / 3;
				maxX = WIDTH / 3;
				maxY = HEIGHT * 2 / 3;
				break;
			case "c":
				minX = WIDTH / 3;
				minY = HEIGHT / 3;
				maxX = WIDTH * 2 / 3;
				maxY = HEIGHT * 2 / 3;
				break;
			case "e":
				minX = WIDTH * 2 / 3;
				minY = HEIGHT / 3;
				maxX = WIDTH - serverSize;
				maxY = HEIGHT * 2 / 3;
				break;
			case "sw":
				minX = serverSize;
				minY = HEIGHT * 2 / 3;
				maxX = WIDTH / 3;
				maxY = HEIGHT - serverSize;
				break;
			case "s":
				minX = WIDTH / 3;
				minY = HEIGHT * 2 / 3;
				maxX = WIDTH * 2 / 3;
				maxY = HEIGHT - serverSize;
				break;
			case "se":
				minX = WIDTH * 2 / 3;
				minY = HEIGHT * 2 / 3;
				maxX = WIDTH - serverSize;
				maxY = HEIGHT - serverSize;
				break;
		}

		x = Math.floor(Math.random() * (maxX - minX) + minX);
		y = Math.floor(Math.random() * (maxY - minY) + minY);

		while (checkCollisions(x, y)) {
			x = Math.floor(Math.random() * (maxX - minX) + minX);
			y = Math.floor(Math.random() * (maxY - minY) + minY);
		}

		servers.push(new Server(x, y));
	};

	this.createClient = function createClient() {
		var x, y, msgNr;
		//client position
		x = Math.floor(Math.random() * (WIDTH - 2 * clientSize) + clientSize);
		y = Math.floor(Math.random() * (HEIGHT - 2 * clientSize) + clientSize);

		while (checkCollisions(x, y)) {
			x = Math.floor(Math.random() * (WIDTH - 2 * clientSize) + clientSize);
			y = Math.floor(Math.random() * (HEIGHT - 2 * clientSize) + clientSize);
		}

		//client messages
		msgNr = Math.floor(Math.random() * (this.maxClientMessages - this.minClientMessages)) +
			this.minClientMessages + Math.floor(popularity / 100);

		clients.push(new Client(x, y, msgNr));
		this.timeLastClient = elapsedTime;
	};

	this.initiateDDoS = function initiateDDoS() {
		var i, x, y, a,
			mod = Math.floor(popularity / 400),
			n = this.attackersNumber + mod;
		for (i = 0; i < n; i += 1) {
			x = Math.floor(Math.random() * (WIDTH - 2 * clientSize) + clientSize);
			y = Math.floor(Math.random() * (HEIGHT - 2 * clientSize) + clientSize);

			while (checkCollisions(x, y)) {
				x = Math.floor(Math.random() * (WIDTH - 2 * clientSize) + clientSize);
				y = Math.floor(Math.random() * (HEIGHT - 2 * clientSize) + clientSize);
			}

			a = new Attacker(x, y, this.attackersMessages + mod, findClosestServer(x, y));

			attackers.push(a);
		}

		this.timeLastDDoS = elapsedTime;
	};
}

var Tutorial = {
	steps: [
		{
			id: 0,
			texts: ["Welcome to Load Balancing: The Game!",
				"Here you will take the role of -you guessed it- a LOAD BALANCER.",
				"Click 'Next' to start the tutorial."],
			setup: function () {
				buttons.push(Tutorial.nextButton);
				buttons.push(Tutorial.homeButton);
				servers.push(new Server(WIDTH / 2, HEIGHT / 2));
				servers[0].capacity = 20;
			},
			run: function () { },
			draw: function () { }
		},
		{
			id: 1,
			texts: ["This is a DATACENTER.",
				"Its role is to send data to your clients.",
				"Click 'Next' to continue."],
			setup: function () { },
			run: function () { },
			draw: function () {
				drawCircleBorder(WIDTH / 2, HEIGHT / 2, serverSize + 9, "fireBrick", 2);
				drawCircleBorder(WIDTH / 2, HEIGHT / 2, serverSize + 10, "red", 3);
			}
		},
		{
			id: 2,
			texts: ["This is a CLIENT.",
				"It wants to exchange data with your datacenter.",
				"Your job will be to connect the clients to a datacenter."],
			setup: function () {
				clients.push(new Client(WIDTH * 3 / 4, HEIGHT / 2, 10000));
				clients[0].life = -31;
			},
			run: function () { },
			draw: function () {
				drawCircleBorder(WIDTH * 3 / 4, HEIGHT / 2, clientSize + 9, "fireBrick", 2);
				drawCircleBorder(WIDTH * 3 / 4, HEIGHT / 2, clientSize + 10, "red", 3);
				drawCircle(WIDTH * 3 / 4, HEIGHT / 2, clientSize / 2, "gray");
			}
		},
		{
			id: 3,
			texts: ["To create a connection, click on the client and then on the datacenter.",
				"Be quick though! Clients don't like waiting!",
				"Create a CONNECTION to continue."],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				if (clients[0].connectedTo !== null) {
					Tutorial.advance();
				}
				if (clients[0].life >= maxClientWaitTime - 1) {
					this.texts = ["Snap! You let too much time pass!",
						"Normally this would be bad for you, but this time you'll get a little help.",
						"Create a CONNECTION to continue."];
					clients[0].life = -31;
				}
				updateClients();
			},
			draw: function () { }
		},
		{
			id: 4,
			texts: ["Good job! Now your very first client is being served.",
				"You can see the REQUESTS and RESPONSES traveling along the connection.",
				"The POPULARITY measures how successful your service is being."],
			setup: function () {
				popularity = 0;
				elapsedTime = 0;
				buttons.push(Tutorial.nextButton);
			},
			run: function () {
				elapsedTime += 1 / frameRate;
				updateMessages();
				updateClients();
				updateServers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);
				drawCircleBorder(70, HEIGHT - 95, 67, "fireBrick", 2);
				drawCircleBorder(70, HEIGHT - 95, 68, "red", 3);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
			}
		},
		{
			id: 5,
			texts: ["Cool! Two new clients want to use your service!",
				"Connect them as well to start gaining some more popularity.",
				"Remember, if you wait too much, you will lose popularity!"],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);
				clients.push(new Client(WIDTH / 4, HEIGHT / 4, 10000));
				clients.push(new Client(WIDTH / 4, HEIGHT * 3 / 4, 10000));
				clients[1].life = - 21;
				clients[2].life = - 21;
			},
			run: function () {
				if (servers[0].queue.length > servers[0].capacity / 2) {
					Tutorial.advance();
				}
				elapsedTime += 1 / frameRate;
				if (clients.length === 1) {
					this.texts = ["Snap! You let too much time pass!",
						"As you can see you lost 10 popularity each.",
						"Connect the two clients to continue."];
					clients.push(new Client(WIDTH / 4, HEIGHT / 4, 10000));
					clients.push(new Client(WIDTH / 4, HEIGHT * 3 / 4, 10000));
					clients[1].life = - 21;
					clients[2].life = - 21;
				}
				updateMessages();
				updateClients();
				updateServers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
			}
		},
		{
			id: 6,
			texts: ["Oh no! Looks like your datacenter can't handle all this traffic!",
				"Clients will not be pleased if your datacenter is too busy to reply.",
				"You can see how busy a datacenter is by looking at its status bar."],
			setup: function () {
				buttons.push(Tutorial.nextButton);
			},
			run: function () {
				elapsedTime += 1 / frameRate;
				updateMessages();
				updateClients();
				updateServers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);

				drawCircleBorder(WIDTH / 2 + serverSize / 2 - 7, HEIGHT / 2 + 1, serverSize / 2, "fireBrick", 2);
				drawCircleBorder(WIDTH / 2 + serverSize / 2 - 7, HEIGHT / 2 + 1, serverSize / 2, "red", 3);
			}
		},
		{
			id: 7,
			texts: ["Thankfully, you are popular enough to afford to UPGRADE your datacenter.",
				"As your popularity grows, you will be able to upgrade it even more.",
				"Press SPACE to pause the game and select an upgrade."],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);
				document.addEventListener("keypress", Tutorial.listener);
			},
			run: function () {
				elapsedTime += 1 / frameRate;
				updateMessages();
				updateClients();
				updateServers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);

				font = "18px sans-serif";
				align = "center";
				color = "darkGray";
				drawText(WIDTH / 2, HEIGHT - 95, "Press space to pause", font, align, baseline, color);

				var text = {
					x: WIDTH / 2,
					y: HEIGHT - 116,
					font: "20px sans-serif",
					color: { r: 255, g: 0, b: 0 },
					id: "upgradeTut",
					text: "- Upgrade available! -",
					life: 1000
				};

				fader.addPermanentText(text);
			}
		},
		{
			id: 8,
			texts: ["Let's improve your datacenter's speed.",
				"This way it will process the clients' requests faster.",
				"Select the third upgrade (Improve speed at one location)."],
			setup: function () {
				document.removeEventListener("keypress", Tutorial.listener);
				fader.removeFromPermanentQueue("upgradeTut");
				buttons = [];

				var x1, y1, x2, y2, x3, y3;
				x1 = 250;
				y1 = y2 = y3 = HEIGHT / 2 + 150;
				buttons.push(new SpecialButton(x1, y1, 100, 100, "#333333", "white", 2, function () { }, function (hovered) {
					var x = 250,
						y = HEIGHT / 2 + 150,
						font = "45px monospace",
						align = "center",
						baseline = "middle",
						color = "red";
					drawText(x1 - 25, y1, "+", font, align, baseline, color);
					drawRect(x1 + 15, y1, serverSize, serverSize, "#DDDDDD", "red", 1);
					drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, "#BBBBBB", "#999999", 2);
					drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, "#BBBBBB", "#999999", 1);

					if (hovered) {
						font = "20px monospace";
						drawText(WIDTH / 2, HEIGHT - 50, "Buy new datacenter", font, align, baseline, color);
					}
				}));

				x2 = WIDTH / 2;
				buttons.push(new SpecialButton(x2, y2, 100, 100, "#333333", "white", 2, function () { }, function (hovered) {
					var queueX = x2 + serverSize / 2 - 7,
						queueY = y2 + 1,
						starX = x2 - serverSize / 2 + 7,
						starY = y2 + serverSize / 2 - 9,
						color = "red",
						lineWidth = 3;
					drawRect(x2, y2, serverSize, serverSize, "#DDDDDD", "#999999", 1);
					drawRect(queueX, queueY, 6, serverSize - 10, "salmon", "red", 1);
					drawStar(starX, starY, 5, 4, 2, "#BBBBBB", "#999999", 2);
					drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth);
					drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth);
					drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth);

					if (hovered) {
						drawText(WIDTH / 2, HEIGHT - 50, "Scale off at one location", "20px monospace", "center", "middle", "red");
					}
				}));

				x3 = WIDTH - 250;
				buttons.push(new SpecialButton(x3, y3, 100, 100, "#333333", "white", 2, function () {
					servers[0].speed += serversSpeed;
					Tutorial.advance();
				}, function (hovered) {
					var queueX = x3 + serverSize / 2 - 7,
						queueY = y3 + 1,
						starX = x3 - serverSize / 2 + 7,
						starY = y3 + serverSize / 2 - 9,
						color = "red",
						lineWidth = 3;
					drawRect(x3, y3, serverSize, serverSize, "#DDDDDD", "#999999", 1);
					drawRect(queueX, queueY, 6, serverSize - 10, "#BBBBBB", "#999999", 1);
					drawStar(starX, starY, 5, 4, 2, "salmon", "red", 2);
					drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth);
					drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth);
					drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth);

					if (hovered) {
						drawText(WIDTH / 2, HEIGHT - 50, "Improve speed at one location", "20px monospace", "center", "middle", "red");
					}
				}));
			},
			run: function () { },
			draw: function () {
				drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT - 160, "#0360AE");
				drawText(WIDTH / 2, HEIGHT / 2 + 60, "Choose an upgrade:", "25px monospace", "center", "middle", "black");
				drawText(WIDTH / 2, HEIGHT / 3, "~ Paused ~", "50px monospace", "center", "middle", "red");
			}
		},
		{
			id: 9,
			texts: ["Nice! You can see your datacenter's speed in the bottom left of it.",
				"Now the clients can finish their data exchange without any more problems.",
				"When a client is served successfully you will gain some more popularity."],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);

				clients[0].messagesToSend = 2;
				clients[0].acksToReceive = 2;
				clients[1].messagesToSend = 6;
				clients[1].acksToReceive = 6;
				clients[2].messagesToSend = 10;
				clients[2].acksToReceive = 10;
				messages.forEach(function (message) {
					if (message.status === "ack") {
						message.receiver.acksToReceive += 1;
					}
					if (message.status === "queued" || message.status === "req") {
						message.sender.acksToReceive += 1;
					}
				});
			},
			run: function () {
				if (clients.length === 0 && buttons.length === 1) {
					buttons.push(Tutorial.nextButton);
				}
				elapsedTime += 1 / frameRate;
				updateMessages();
				updateClients();
				updateServers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);

				drawCircleBorder(WIDTH / 2 - serverSize / 2 + 7, HEIGHT / 2 + serverSize / 4, 15, "fireBrick", 2);
				drawCircleBorder(WIDTH / 2 - serverSize / 2 + 7, HEIGHT / 2 + serverSize / 4, 15, "red", 3);
			}
		},
		{
			id: 10,
			texts: ["Snap! Your datacenter is under a DDOS ATTACK! And more clients need serving!",
				"This is likely to happen as you get more and more popular.",
				"You'd better upgrade once again to cope with this situation."],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);

				clients.push(new Client(WIDTH / 4, HEIGHT / 3, 10000));
				clients.push(new Client(WIDTH * 3 / 4, HEIGHT / 3, 10000));
				clients[0].life = - 21;
				clients[1].life = - 21;
				attackers.push(new Attacker(WIDTH / 2, HEIGHT * 3 / 4, 10000, servers[0]));
				attackers.push(new Attacker(WIDTH / 3, HEIGHT * 2 / 3, 10000, servers[0]));
				attackers.push(new Attacker(WIDTH * 2 / 3, HEIGHT * 2 / 3, 10000, servers[0]));

				document.addEventListener("keypress", Tutorial.listener);
			},
			run: function () {
				if (selectedClient) {
					selectedClient = null;
				}
				elapsedTime += 1 / frameRate;
				if (clients.length === 0) {
					clients.push(new Client(WIDTH / 4, HEIGHT / 3, 10000));
					clients.push(new Client(WIDTH * 3 / 4, HEIGHT / 3, 10000));
					clients[0].life = - 21;
					clients[1].life = - 21;
				}
				updateMessages();
				updateClients();
				updateServers();
				updateAttackers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);

				font = "18px sans-serif";
				align = "center";
				color = "darkGray";
				drawText(WIDTH / 2, HEIGHT - 95, "Press space to pause", font, align, baseline, color);

				var text = {
					x: WIDTH / 2,
					y: HEIGHT - 116,
					font: "20px sans-serif",
					color: { r: 255, g: 0, b: 0 },
					id: "upgradeTut",
					text: "- Upgrade available! -",
					life: 400
				};

				fader.addPermanentText(text);
			}
		},
		{
			id: 11,
			texts: ["This time let's buy a new datacenter.",
				"This way you can connect the clients to it while your first one is under attack.",
				"Select the first upgrade (Buy new datacenter)."],
			setup: function () {
				document.removeEventListener("keypress", Tutorial.listener);
				fader.removeFromPermanentQueue("upgradeTut");
				buttons = [];

				var x1, y1, x2, y2, x3, y3;
				x1 = 250;
				y1 = y2 = y3 = HEIGHT / 2 + 150;
				buttons.push(new SpecialButton(x1, y1, 100, 100, "#333333", "white", 2, function () {
					servers.push(new Server(WIDTH / 2, HEIGHT / 4));
					servers[0].capacity = 20;
					Tutorial.advance();
				}, function (hovered) {
					var x = 250,
						y = HEIGHT / 2 + 150,
						font = "45px monospace",
						align = "center",
						baseline = "middle",
						color = "red";
					drawText(x1 - 25, y1, "+", font, align, baseline, color);
					drawRect(x1 + 15, y1, serverSize, serverSize, "#DDDDDD", "red", 1);
					drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, "#BBBBBB", "#999999", 2);
					drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, "#BBBBBB", "#999999", 1);

					if (hovered) {
						font = "20px monospace";
						drawText(WIDTH / 2, HEIGHT - 50, "Buy new datacenter", font, align, baseline, color);
					}
				}));

				x2 = WIDTH / 2;
				buttons.push(new SpecialButton(x2, y2, 100, 100, "#333333", "white", 2, function () { }, function (hovered) {
					var queueX = x2 + serverSize / 2 - 7,
						queueY = y2 + 1,
						starX = x2 - serverSize / 2 + 7,
						starY = y2 + serverSize / 2 - 9,
						color = "red",
						lineWidth = 3;
					drawRect(x2, y2, serverSize, serverSize, "#DDDDDD", "#999999", 1);
					drawRect(queueX, queueY, 6, serverSize - 10, "salmon", "red", 1);
					drawStar(starX, starY, 5, 4, 2, "#BBBBBB", "#999999", 2);
					drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth);
					drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth);
					drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth);

					if (hovered) {
						drawText(WIDTH / 2, HEIGHT - 50, "Scale off at one location", "20px monospace", "center", "middle", "red");
					}
				}));

				x3 = WIDTH - 250;
				buttons.push(new SpecialButton(x3, y3, 100, 100, "#333333", "white", 2, function () { }, function (hovered) {
					var queueX = x3 + serverSize / 2 - 7,
						queueY = y3 + 1,
						starX = x3 - serverSize / 2 + 7,
						starY = y3 + serverSize / 2 - 9,
						color = "red",
						lineWidth = 3;
					drawRect(x3, y3, serverSize, serverSize, "#DDDDDD", "#999999", 1);
					drawRect(queueX, queueY, 6, serverSize - 10, "#BBBBBB", "#999999", 1);
					drawStar(starX, starY, 5, 4, 2, "salmon", "red", 2);
					drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth);
					drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth);
					drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth);

					if (hovered) {
						drawText(WIDTH / 2, HEIGHT - 50, "Improve speed at one location", "20px monospace", "center", "middle", "red");
					}
				}));
			},
			run: function () { },
			draw: function () {
				drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT - 160, "#0360AE");
				drawText(WIDTH / 2, HEIGHT / 2 + 60, "Choose an upgrade:", "25px monospace", "center", "middle", "black");
				drawText(WIDTH / 2, HEIGHT / 3, "~ Paused ~", "50px monospace", "center", "middle", "red");
			}
		},
		{
			id: 12,
			texts: ["Perfect! Now you have a new datacenter at your disposal.",
				"This is when a good load balancing strategy will start to matter.",
				"Indeed you would be wiser to connect the clients to the new datacenter."],
			setup: function () {
				buttons = [];
				buttons.push(Tutorial.homeButton);

				clients[0].life = - 21;
				clients[1].life = - 21;
			},
			run: function () {
				elapsedTime += 1 / frameRate;
				if (clients.length === 0) {
					clients.push(new Client(WIDTH / 4, HEIGHT / 3, 10000));
					clients.push(new Client(WIDTH * 3 / 4, HEIGHT / 3, 10000));
					clients[0].life = - 21;
					clients[1].life = - 21;
				}
				if (clients[0].connectedTo !== null && clients[1].connectedTo !== null) {
					Tutorial.advance();
				}
				updateMessages();
				updateClients();
				updateServers();
				updateAttackers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);
			}
		},
		{
			id: 13,
			texts: ["Excellent! By now you should know all the basics.",
				"This tutorial is finished.",
				"You can start a new game or go back to the main menu."],
			setup: function () {
				buttons = [];
				buttons.push(new Button(WIDTH / 3, HEIGHT - 40, 120, 40, "New game", "#FFFFFF", resetGame));
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				elapsedTime += 1 / frameRate;
				updateMessages();
				updateClients();
				updateServers();
				updateAttackers();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularity, font, align, baseline, color);

				font = "10px sans-serif";
				drawText(WIDTH - 118 + messageSize / 2, 100, ": Request", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + messageSize + 5, ": Response (+1)", font, align, baseline, color);
				drawText(WIDTH - 118 + messageSize / 2, 100 + 2 * (messageSize + 5), ": Datacenter busy (-1)", font, align, baseline, color);
				drawCircle(WIDTH - 120, 100, messageSize / 2, "lightBlue", "skyBlue", 2);
				drawCircle(WIDTH - 120, 100 + messageSize + 5, messageSize / 2, "lime", "limeGreen", 2);
				drawCircle(WIDTH - 120, 100 + 2 * (messageSize + 5), messageSize / 2, "tomato", "indianRed", 2);
			}
		}
	],
	currentStep: null,
	nextButton: null,
	homeButton: null,
	initialize: function () {
		servers = [];
		clients = [];
		messages = [];
		buttons = [];
		attackers = [];
		fader.emptyQueues();
		this.nextButton = new Button(WIDTH / 3, HEIGHT - 40, 120, 40, "Next", "#FFFFFF", function () {
			Tutorial.advance();
		});
		this.homeButton = new Button(WIDTH * 2 / 3, HEIGHT - 40, 120, 40, "Exit tutorial", "#FFFFFF", function () {
			switchMode(gameModes.MENU);
		});
		this.currentStep = this.steps[0];
		this.currentStep.setup();
	},
	run: function () {
		this.currentStep.run();
		fader.update(1 / frameRate);
		this.draw();
	},
	draw: function () {
		clear();
		drawGame();
		fader.draw();
		drawRect(WIDTH / 2, 40, WIDTH, 80, "#0360AE", "#02467F", 1);
		var i, currentTexts = this.currentStep.texts;
		for (i = 0; i < currentTexts.length; i++) {
			var t = currentTexts[i];
			drawText(WIDTH / 2, 18 + 20 * i, t, "bold 18px monospace", "center", "middle", "white");
		}
		drawRect(WIDTH / 2, HEIGHT - 40, WIDTH, 80, "#0360AE", "#02467F", 1);
		this.currentStep.draw();
		drawButtons();
	},
	advance: function () {
		this.currentStep = this.steps[this.currentStep.id + 1];
		this.currentStep.setup();
	},
	listener: function (event) {
		if (event.keyCode === 32) {
			Tutorial.advance();
		}
	}
}

//methods
function init() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	WIDTH = canvas.width;
	HEIGHT = canvas.height;

	sched = new Scheduler();
	fader = new TextFader(context);
	fpsCounter = new FpsCounter();
	music = new Audio("assets/music.mp3");
	music.loop = true;
	//music.play();

	sched.createServer("c");

	$clouds.createCloud(WIDTH / 4, HEIGHT / 4, 220);
	$clouds.createCloud(0 - WIDTH / 4, HEIGHT / 2, 220);
	$clouds.createCloud(WIDTH / 2, HEIGHT / 2, 220, 40);
	$clouds.createCloud(0 - WIDTH / 2, HEIGHT * 3 / 4, 220);
	$clouds.createCloud(WIDTH * 3 / 4, HEIGHT / 4, 220);
	$clouds.createCloud(0 - WIDTH * 3 / 4, HEIGHT / 2, 220);

	//attach mouse listeners to the canvas
	canvas.addEventListener('mousedown', mouseDownHandler);
	canvas.addEventListener('mouseup', mouseUpHandler);
	canvas.addEventListener('click', clickHandler);
	canvas.addEventListener('mousemove', function (event) {
		mouseX = event.clientX - canvas.offsetLeft;
		mouseY = event.clientY - canvas.offsetTop;
	});

	document.addEventListener("keypress", keyboardHandler);


	canvas.addEventListener("touchstart", touchHandler, false);
	canvas.addEventListener("touchmove", touchHandler, false);
	canvas.addEventListener("touchend", touchHandler, false);
	canvas.addEventListener("touchcancel", touchHandler, false);

	window.onblur = function () {
		if (currentGameMode === gameModes.GAME) {
			switchMode(gameModes.PAUSE);
		}
	};

	currentGameMode = gameModes.MENU;

	return setInterval(mainLoop, 1000 / frameRate);
}

function mainLoop() {
	switch (currentGameMode) {
		case gameModes.MENU:
			menuLoop();
			break;
		case gameModes.GAME:
			gameLoop();
			break;
		case gameModes.GAMEOVER:
			gameOverLoop();
			break;
		case gameModes.CREDITS:
			creditsLoop();
			break;
		case gameModes.PAUSE:
			pauseLoop();
			break;
		case gameModes.UPGRADE:
			upgradeLoop();
			break;
		case gameModes.TUTORIAL:
			Tutorial.run();
			break;
	}

	if (logActive) {
		fpsCounter.update();
		fpsCounter.logFps();
	}
}

function gameLoop() {
	elapsedTime += 1 / frameRate;
	var m = Math.floor(elapsedTime / 60);

	if (m === gameLength && clients.length === 0) {
		switchMode(gameModes.GAMEOVER);
		return;
	}

	updateMessages();
	updateClients();
	updateAttackers();
	updateServers();
	fader.update(1 / frameRate);

	sched.schedule();

	drawGame();
}

function menuLoop() {
	if (buttons.length === 0) {
		buttons.push(new Button(WIDTH / 2, HEIGHT / 2, 120, 40, "Tutorial", "#FFFFFF", function () {
			switchMode(gameModes.TUTORIAL);
			Tutorial.initialize();
		}));
		buttons.push(new Button(WIDTH / 2, HEIGHT / 2 + 60, 120, 40, "New Game", "#FFFFFF", resetGame));
		buttons.push(new Button(WIDTH / 2, HEIGHT / 2 + 120, 120, 40, "Credits", "#FFFFFF", function () {
			switchMode(gameModes.CREDITS);
		}));

		buttons.push(volumeButton);
	}
	drawMenu();
}

function gameOverLoop() {
	if (buttons.length === 0) {
		buttons.push(new Button(WIDTH / 2, HEIGHT - 110, 120, 40, "Restart", "#FFFFFF", resetGame));
		var homeButton = new Button(WIDTH / 2, HEIGHT - 60, 120, 40, "Menu", "#FFFFFF", function () {
			switchMode(gameModes.MENU);
		});
		buttons.push(homeButton);
	}
	drawGameOver();
}

function creditsLoop() {
	if (buttons.length === 0) {
		var homeButton = new Button(WIDTH / 2, HEIGHT - 60, 120, 40, "Back", "#FFFFFF", function () {
			switchMode(gameModes.MENU);
		});
		buttons.push(homeButton);
	}
	drawCredits();
}

function pauseLoop() {
	if (buttons.length === 0) {
		buttons.push(new Button(WIDTH / 2, 150, 120, 40, "Continue", "#FFFFFF", function () {
			switchMode(gameModes.GAME);
		}));
		buttons.push(new Button(WIDTH / 2, 210, 120, 40, "New game", "#FFFFFF", resetGame));
		buttons.push(new Button(WIDTH / 2, 270, 120, 40, "Abandon", "#FFFFFF", function () {
			switchMode(gameModes.MENU);
		}));

		buttons.push(volumeButton);

		if (upgradesAvailable > 0) {
			var x1, y1, x2, y2, x3, y3;
			x1 = 250;
			y1 = y2 = y3 = HEIGHT / 2 + 150;
			buttons.push(new SpecialButton(x1, y1, 100, 100, "#333333", "white", 2, function () {
				selectedUpgrade = "server";
				switchMode(gameModes.UPGRADE);
			}, function (hovered) {
				var x = 250,
					y = HEIGHT / 2 + 150,
					font = "45px monospace",
					align = "center",
					baseline = "middle",
					color = "red";
				drawText(x1 - 25, y1, "+", font, align, baseline, color);
				drawRect(x1 + 15, y1, serverSize, serverSize, "#DDDDDD", "red", 1);
				drawStar(x1 - serverSize / 2 + 22, y1 + serverSize / 2 - 9, 5, 4, 2, "#BBBBBB", "#999999", 2);
				drawRect(x1 + serverSize / 2 + 8, y1 + 1, 6, serverSize - 10, "#BBBBBB", "#999999", 1);

				if (hovered) {
					font = "20px monospace";
					drawText(WIDTH / 2, HEIGHT - 50, "Buy new datacenter", font, align, baseline, color);
				}
			}));

			x2 = WIDTH / 2;
			buttons.push(new SpecialButton(x2, y2, 100, 100, "#333333", "white", 2, function () {
				selectedUpgrade = "capacity";
				switchMode(gameModes.UPGRADE);
			}, function (hovered) {
				var queueX = x2 + serverSize / 2 - 7,
					queueY = y2 + 1,
					starX = x2 - serverSize / 2 + 7,
					starY = y2 + serverSize / 2 - 9,
					color = "red",
					lineWidth = 3;
				drawRect(x2, y2, serverSize, serverSize, "#DDDDDD", "#999999", 1);
				drawRect(queueX, queueY, 6, serverSize - 10, "salmon", "red", 1);
				drawStar(starX, starY, 5, 4, 2, "#BBBBBB", "#999999", 2);
				drawLine(queueX, queueY - serverSize / 2 + 2, queueX, queueY - serverSize / 2 - 13, color, lineWidth);
				drawLine(queueX - 1, queueY - serverSize / 2 - 13, queueX + 5, queueY - serverSize / 2 - 6, color, lineWidth);
				drawLine(queueX + 1, queueY - serverSize / 2 - 13, queueX - 5, queueY - serverSize / 2 - 6, color, lineWidth);

				if (hovered) {
					drawText(WIDTH / 2, HEIGHT - 50, "Scale off at one location", "20px monospace", "center", "middle", "red");
				}
			}));

			x3 = WIDTH - 250;
			buttons.push(new SpecialButton(x3, y3, 100, 100, "#333333", "white", 2, function () {
				selectedUpgrade = "speed";
				switchMode(gameModes.UPGRADE);
			}, function (hovered) {
				var queueX = x3 + serverSize / 2 - 7,
					queueY = y3 + 1,
					starX = x3 - serverSize / 2 + 7,
					starY = y3 + serverSize / 2 - 9,
					color = "red",
					lineWidth = 3;
				drawRect(x3, y3, serverSize, serverSize, "#DDDDDD", "#999999", 1);
				drawRect(queueX, queueY, 6, serverSize - 10, "#BBBBBB", "#999999", 1);
				drawStar(starX, starY, 5, 4, 2, "salmon", "red", 2);
				drawLine(starX, starY - 8, starX, starY - 21, color, lineWidth);
				drawLine(starX - 1, starY - 21, starX + 5, starY - 14, color, lineWidth);
				drawLine(starX + 1, starY - 21, starX - 5, starY - 14, color, lineWidth);

				if (hovered) {
					drawText(WIDTH / 2, HEIGHT - 50, "Improve speed at one location", "20px monospace", "center", "middle", "red");
				}
			}));
		}
	}

	drawPause();
}

function upgradeLoop() {
	if (buttons.length === 0) {
		buttons.push(new Button(WIDTH / 2, HEIGHT - 100, 120, 40, "Cancel", "#333333", function () {
			switchMode(gameModes.PAUSE);
		}));

		switch (selectedUpgrade) {
			case "speed":
				servers.forEach(function (server) {
					buttons.push(new BorderButton(server.x, server.y, serverSize, serverSize,
						"", "rgba(0,0,0,0)", "limeGreen", 2, function () {
							server.speed += 2;
							upgradesAvailable -= 1;
							fader.removeFromPermanentQueue("upgrade");
							switchMode(gameModes.PAUSE);
						}))
				});
				break;
			case "capacity":
				servers.forEach(function (server) {
					buttons.push(new BorderButton(server.x, server.y, serverSize, serverSize,
						"", "rgba(0,0,0,0)", "limeGreen", 2, function () {
							server.capacity += serversCapacity;
							upgradesAvailable -= 1;
							fader.removeFromPermanentQueue("upgrade");
							switchMode(gameModes.PAUSE);
						}))
				});
				break;
			case "server":
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("nw");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("n");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("ne");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("w");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("c");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("e");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("sw");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("s");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("se");
						upgradesAvailable -= 1;
						fader.removeFromPermanentQueue("upgrade");
						switchMode(gameModes.PAUSE);
					}));
				break;
		}
	}

	drawUpgrade();
}

function drawGame() {
	clear();

	//draw a line connecting the selected client to the mouse pointer
	if (selectedClient !== null) {
		drawLine(selectedClient.x, selectedClient.y, mouseX, mouseY, "lightBlue", 3);
		drawCircle(selectedClient.x, selectedClient.y, clientSize / 2 + 3, "lightBlue");
	}

	drawConnections();
	drawMessages();
	drawClients();
	drawAttackers();
	drawServers();
	drawUI();
}

function drawMenu() {
	var font = "small-caps bold 110px monospace",
		align = "center",
		baseline = "middle",
		color = "rgba(255,255,255,0.6)";

	clear();
	drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, "#0360AE");
	$clouds.draw(context);
	drawRect(WIDTH / 2, 140, WIDTH, 180, "rgba(0,0,0,0.1)", "rgba(200,200,200,0.5)");
	drawText(WIDTH / 2, 110, "Load Balancing", font, align, baseline, color, 1, "#fff");
	font = "45px monospace";
	drawText(WIDTH / 2, 185, "The Game", font, align, baseline, color, 1, "rgba(255,255,255,0.9)");

	drawLine(120, 160, WIDTH - 118, 160, "red", 2);

	drawButtons();
}

function drawGameOver() {
	var x = WIDTH / 2,
		font = "small-caps 60px monospace",
		align = "center",
		baseline = "middle",
		color = "red";

	clear();
	drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, "#0360AE");
	$clouds.draw(context);
	drawText(WIDTH / 2, 100, "Game Over", font, align, baseline, color);

	color = "white";
	align = "end";
	font = "15px monospace";
	x += 80;
	drawText(x, HEIGHT / 2 - 80, "Succesful connections:", font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 55, "Dropped connections:", font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 30, "Failed connections:", font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 5, "Average response time:", font, align, baseline, color);
	align = "start";
	x += 10;
	drawText(x, HEIGHT / 2 - 80, clientsServed, font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 55, droppedConnections, font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 30, failedConnections, font, align, baseline, color);
	drawText(x, HEIGHT / 2 - 5, Math.round(avgResponseTime * 100) / 100, font, align, baseline, color);

	font = "30px monospace";
	drawText(WIDTH / 2 + 75, HEIGHT / 2 + 50, popularity, font, align, baseline, color);
	align = "end";
	drawText(WIDTH / 2 + 68, HEIGHT / 2 + 50, "Popularity:", font, align, baseline, color);

	drawLine(WIDTH / 2 - 130, HEIGHT / 2 + 20, WIDTH / 2 + 130, HEIGHT / 2 + 20, "red", 1);

	drawButtons();
}

function drawCredits() {
	var x = WIDTH / 2,
		font = "bold 20px monospace",
		align = "center",
		baseline = "middle",
		color = "red";

	clear();
	drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, "#0360AE");
	$clouds.draw(context);
	drawRect(WIDTH / 2, 128, WIDTH, 100, "rgba(0,0,0,0.1)", "rgba(200,200,200,0.5)");
	drawRect(WIDTH / 2, 258, WIDTH, 100, "rgba(0,0,0,0.1)", "rgba(200,200,200,0.5)");
	drawRect(WIDTH / 2, 388, WIDTH, 100, "rgba(0,0,0,0.1)", "rgba(200,200,200,0.5)");

	drawText(x, 100, "An idea by:", font, align, baseline, color);
	drawText(x, 230, "Designed and developed by:", font, align, baseline, color);
	drawText(x, 360, "Music by:", font, align, baseline, color);

	color = "white";
	font = "30px monospace";
	drawText(x, 125, "Treestle", font, align, baseline, color);
	drawText(x, 255, "Naccio", font, align, baseline, color);
	drawText(x, 385, "Macspider", font, align, baseline, color);

	color = "#DDDDDD";
	font = "15px monospace";
	drawText(x, 156, "(treestle.com)", font, align, baseline, color);
	drawText(x, 286, "(naccio.net)", font, align, baseline, color);
	drawText(x, 416, "(soundcloud.com/macspider)", font, align, baseline, color);

	drawButtons();
}

function drawPause() {
	var x = WIDTH / 2,
		font = "25px monospace",
		align = "center",
		baseline = "middle",
		color;

	clear();
	drawRect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, "#0360AE");
	$clouds.draw(context);

	if (upgradesAvailable > 0) {
		color = "black";
		drawText(x, HEIGHT / 2 + 60, "Choose an upgrade:", font, align, baseline, color);
	} else {
		color = "#DDDDDD";
		drawText(x, HEIGHT / 2 + 60, "No upgrades available", font, align, baseline, color);
	}

	color = "red";
	font = "50px monospace";
	drawText(x, 60, "~ Paused ~", font, align, baseline, color);

	drawButtons();
}

function drawUpgrade() {
	clear();

	drawServers();
	drawButtons();

	var text;
	switch (selectedUpgrade) {
		case "speed":
		case "capacity":
			text = "location";
			break;
		case "server":
			text = "zone";
			break;
	}
	drawText(WIDTH / 2, 60, "~ Select " + text + " ~", "30px monospace", "center", "middle", "red");
}

function updatePopularity(amount, x, y) {
	var text,
		fontSize = 12,
		color = { r: 0, g: 150, b: 0 },
		borderColor = { r: 150, g: 250, b: 150 },
		borderWidth = 1;

	if (text > 0) {
		text = "+" + text;
	}

	if (amount < 0) {
		color = { r: 150, g: 0, b: 0 };
		borderColor = { r: 250, g: 150, b: 150 };
	}

	if (Math.abs(amount) >= 5) {
		fontSize = 16;
		borderWidth = 2;
	}

	text = {
		text: amount,
		color: color,
		fontSize: fontSize,
		fontWeight: "bold",
		border: true,
		borderColor: borderColor,
		borderWidth: borderWidth
	}

	fader.addText(text, x.toString() + y.toString());
	popularity += amount;
	if (popularity >= upgrades[nextUpgrade] && nextUpgrade < upgrades.length) {
		nextUpgrade += 1;
		upgradesAvailable += 1;
	}
}

function updateServers() {
	servers.forEach(function (s) {
		if ((elapsedTime - s.lastMessageTime) > 1 / s.speed) {
			s.sendMessage();
		}
	});
}

function updateClients() {
	var remaining = gameLength * 60 - elapsedTime,
		i;

	for (i = 0; i < clients.length; i++) {
		var c = clients[i];

		if (remaining <= 0 && c.messagesToSend > 0) {
			c.acksToReceive -= c.messagesToSend;
			c.messagesToSend = 0;
		}

		//Check if client is done sending messages
		if (c.messagesToSend === 0 && c.acksToReceive === 0) {
			clients.splice(i--, 1);
			clientsServed += 1;
			continue;
		}

		//Check if client received too many nacks
		if (c.nacksToDie === 0) {
			c.connectedTo = null;
			clients.splice(i--, 1);
			droppedConnections += 1;
			continue;
		}

		if (c.connectedTo === null) {
			c.life += 1 / frameRate;

			//Check if client waited too much
			if (remaining <= 0 || c.life > maxClientWaitTime) {
				clients.splice(i--, 1);
				if (c === selectedClient) {
					selectedClient = null;
				}
				failedConnections += 1;
				updatePopularity(-10, c.x, c.y);
			}
		} else {
			if (c.messagesToSend > 0 && (elapsedTime - c.lastMessageTime) > 1 / clientsSpeed) {
				c.sendMessage();
			}
		}
	}
}

function updateAttackers() {
	var i;
	for (i = 0; i < attackers.length; i += 1) {
		var a = attackers[i];

		a.life += 1 / frameRate;

		//check if all attacker messages have reached the server
		var d = getDistance(a.x, a.y, a.connectedTo.x, a.connectedTo.y);
		if (a.messagesToReceive === 0) {
			a.connectedTo = null;
			attackers.splice(i--, 1);
			continue;
		}

		if (a.messagesToSend != 0 && elapsedTime - a.lastMessageTime > 0.5 / clientsSpeed) {
			a.sendMessage();
		}
	}
}

function updateMessages() {
	var i;
	for (i = 0; i < messages.length; i += 1) {
		var m = messages[i];

		m.life += 1 / frameRate;

		//check if connection has been dropped while message was still travelling
		if (m.status === "req") {
			if (m.sender.connectedTo === null) {
				messages.splice(i--, 1);
				continue;
			}
		}

		if (m.status === "ack" || m.status === "nack") {
			if (m.receiver.connectedTo === null) {
				messages.splice(i--, 1);
				continue;
			}
		}

		//check if message has ended its journey
		if (m.status === "done") {
			messages.splice(i--, 1);
			continue;
		}

		//update message
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

function mouseDownHandler(event) {
	if (currentGameMode == gameModes.GAME || currentGameMode == gameModes.TUTORIAL) {
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;

		//check if a server has been clicked
		if (selectedClient !== null) {
			servers.forEach(function (server) {
				if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
					y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
					selectedClient.connectedTo = server;
				}
			});
		}

		selectedClient = null;

		//check if a client has been clicked
		clients.forEach(function (client) {
			if (x > client.x - clientSize / 2 - 5 && x < client.x + clientSize / 2 + 5 &&
				y > client.y - serverSize / 2 - 5 && y < client.y + serverSize / 2 + 5) {
				if (client.connectedTo === null) {
					selectedClient = client;
					mouseX = client.x;
					mouseY = client.y;
				}
			}
		});
	}
}

function mouseUpHandler(event) {
	if (currentGameMode == gameModes.GAME || currentGameMode == gameModes.TUTORIAL) {
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;

		//check if a server has been clicked
		if (selectedClient !== null) {
			servers.forEach(function (server) {
				if (x > server.x - serverSize / 2 - 5 && x < server.x + serverSize / 2 + 5 &&
					y > server.y - serverSize / 2 - 5 && y < server.y + serverSize / 2 + 5) {
					selectedClient.connectedTo = server;
					selectedClient = null;
				}
			});
		}
	}
}

function clickHandler(event) {
	var x = event.pageX - canvas.offsetLeft;
	var y = event.pageY - canvas.offsetTop;

	buttons.some(function (button) {
		if (x > button.x - button.width / 2 && x < button.x + button.width / 2 &&
			y > button.y - button.height / 2 && y < button.y + button.height / 2) {
			button.onClick();
			return true;
		}
	});
}

function touchHandler(event) {
	event.preventDefault();

	var touch = event.targetTouches[0];

	if (event.type == "touchstart") {
		var x = touch.pageX - canvas.offsetLeft;
		var y = touch.pageY - canvas.offsetTop;

		mouseX = x;
		mouseY = y;
		buttons.forEach(function (button) {
			if (x > button.x - button.width / 2 && x < button.x + button.width / 2 &&
				y > button.y - button.height / 2 && y < button.y + button.height / 2) {
				button.onClick();
			}
		});

		mouseDownHandler(touch);
	}
	else if (event.type == "touchmove") {
		var x = touch.pageX - canvas.offsetLeft;
		var y = touch.pageY - canvas.offsetTop;

		mouseX = x;
		mouseY = y;
	}
	else if (event.type == "touchend") {
		if (selectedClient !== null) {
			servers.forEach(function (server) {
				if (mouseX > server.x - serverSize / 2 - 5 && mouseX < server.x + serverSize / 2 + 5
					&& mouseY > server.y - serverSize / 2 - 5 && mouseY < server.y + serverSize / 2 + 5) {
					selectedClient.connectedTo = server;
				}
			});
			if (mouseX < selectedClient.x - clientSize / 2 - 5 || mouseX > selectedClient.x + clientSize / 2 + 5
				|| mouseY < selectedClient.y - clientSize / 2 - 5 || mouseY > selectedClient.y + clientSize / 2 + 5) {
				selectedClient = null;
			}
		}
	}
}

function keyboardHandler(event) {
	event.preventDefault();
	switch (event.keyCode) {
		// SPACEBAR
		case 32:
			if (currentGameMode === gameModes.GAME) {
				switchMode(gameModes.PAUSE);
			} else if (currentGameMode === gameModes.PAUSE) {
				switchMode(gameModes.GAME);
			}
	}
}

function drawServers() {
	servers.forEach(function (server) {
		var i = server.capacity / serversCapacity - 1;

		if (i < 0) {
			i = 0;
		}
		for (; i > -1; i -= 1) {
			var fill = "rgb(0," + (128 - 15 * i) + ",0)",
				border = "rgb(0," + (100 - 15 * i) + ",0)";
			drawRect(server.x + 3 * i, server.y - 3 * i, serverSize, serverSize, fill, border, 1);
		}

		//draw server's queue
		var queueWidth = 5,
			queueHeight = serverSize - 10,
			queueX = server.x + serverSize / 2 - 7,
			queueY = server.y + 1,
			fillPercentage = (server.queue.length / server.capacity) * 100,
			gradientWidth = 5,
			gradientHeight = fillPercentage * queueHeight / 100,
			gradientX = queueX,
			gradientY = queueY + queueHeight / 2 - gradientHeight / 2;

		drawRectBorder(queueX, queueY, queueWidth, queueHeight, "#004500", 1);
		var grd = context.createLinearGradient(gradientX, queueY + queueHeight / 2, gradientX, queueY - queueHeight / 2);
		grd.addColorStop(0.5, 'limeGreen');
		grd.addColorStop(1, 'red');
		drawRect(gradientX, gradientY, gradientWidth, gradientHeight, grd);

		//draw server's speed
		var starX, starY;
		for (i = server.speed; i > 0; i -= serversSpeed) {
			starX = server.x - serverSize / 2 + 7;
			starY = server.y + serverSize / 2 - 4 - 5 * (i / serversSpeed)
			drawStar(starX, starY, 5, 4, 2, "limeGreen", "#004500", 2);
		}
	});
}

function drawClients() {
	clients.forEach(function (client) {
		var x = client.x,
			y = client.y;

		if (client.connectedTo === null) {
			if (client.connectedTo === null && client.life > maxClientWaitTime - 2) {
				drawCircle(x, y, clientSize / 2, "red", "fireBrick", 2);
			} else if (client.connectedTo === null && client.life > maxClientWaitTime - 3.5) {
				drawCircle(x, y, clientSize / 2, "tomato", "indianRed", 2);
			} else {
				drawCircle(x, y, clientSize / 2, "gray", "dimGray", 2);
			}

			drawText(x, y, Math.round(maxClientWaitTime - client.life), "bold 15px Arial", "center", "middle", "white");
		}
		else {
			drawCircle(x, y, clientSize / 2, "gray", "dimGray", 2);
		}
	});
}

function drawAttackers() {
	attackers.forEach(function (attacker) {
		var x = attacker.x,
			y = attacker.y;

		drawTriangle(x, y, clientSize * 2 / Math.sqrt(3), clientSize, "#333333", "black", 2);

		drawText(x, y + 5, "DoS", "bold 10px Arial", "center", "middle", "white");
	});
}

function drawConnections() {
	clients.forEach(function (client) {

		var x = client.x,
			y = client.y;

		if (client.connectedTo !== null) {
			drawLine(x, y, client.connectedTo.x, client.connectedTo.y, "darkGray", 1);
		}
	});

	attackers.forEach(function (attacker) {
		var x = attacker.x,
			y = attacker.y;

		if (attacker.connectedTo !== null) {
			drawLine(x, y, attacker.connectedTo.x, attacker.connectedTo.y, "dimGray", 1);
		}
	});
}

function drawMessages() {
	messages.forEach(function (m) {
		var fill, border;

		if (m.status != "queued" && m.status != "done") {
			if (m.status === "req") {
				fill = "lightBlue";
				border = "steelBlue";
			} else if (m.status === "ack") {
				fill = "lime";
				border = "limeGreen"
			} else if (m.status === "nack") {
				fill = "tomato";
				border = "indianRed";
			}

			drawCircle(m.x, m.y, messageSize / 2, fill, border, 1);
		}
	});
}

function drawButtons() {
	buttons.forEach(function (button) {
		if (mouseX > button.x - (button.width + 2) / 2 &&
			mouseX < button.x + (button.width + 2) / 2 &&
			mouseY > button.y - (button.height + 4) / 2 &&
			mouseY < button.y + (button.height + 2) / 2) {

			button.draw(true, context);
		}
		else {
			button.draw(false, context);
		}
	});
}

function drawUI() {
	var font = "18px sans-serif",
		align = "start",
		baseline = "alphabetic",
		color = "black";

	fader.draw();

	//bottom left
	drawText(10, HEIGHT - 14, "Popularity: " + popularity, font, align, baseline, color);

	//bottom center
	align = "center";
	color = "darkGray";
	drawText(WIDTH / 2, HEIGHT - 14, "Press space to pause", font, align, baseline, color);

	if (upgradesAvailable > 0) {
		var text = {
			x: WIDTH / 2,
			y: HEIGHT - 35,
			font: "20px sans-serif",
			color: { r: 255, g: 0, b: 0 },
			id: "upgrade",
			text: "- Upgrade available! -",
			life: 400
		}

		fader.addPermanentText(text);
	}

	//bottom right
	var remaining = Math.max(0, gameLength * 60 - elapsedTime);
	var m = Math.floor(remaining / 60);
	var s = Math.floor(remaining - m * 60);
	var text = "";
	if (m < 10) text += "0";
	text += m + ":";
	if (s < 10) text += "0";
	text += s;

	align = "end";
	color = "black";
	if (remaining <= 30) {
		color = "tomato";
	}
	if (remaining <= 10) {
		color = "red";
	}
	drawText(WIDTH - 10, HEIGHT - 14, text, font, align, baseline, color);
}

function checkCollisions(x, y) {
	for (var i = 0; i < servers.length; i += 1) {
		s = servers[i];
		if (Math.abs(x - s.x) < serverSize && Math.abs(y - s.y) < 2 * serverSize) {
			return true;
		}
	}
	for (var i = 0; i < clients.length; i += 1) {
		c = clients[i];
		if (Math.abs(x - c.x) < clientSize && Math.abs(y - c.y) < clientSize) {
			return true;
		}
	}
	for (var i = 0; i < attackers.length; i += 1) {
		c = attackers[i];
		if (Math.abs(x - c.x) < clientSize && Math.abs(y - c.y) < clientSize) {
			return true;
		}
	}
}

function findClosestServer(x, y) {
	var closest,
		currentDistance = WIDTH;

	servers.forEach(function (server) {
		var newDistance = getDistance(x, y, server.x, server.y);
		if (newDistance < currentDistance) {
			currentDistance = newDistance;
			closest = server;
		}
	});

	return closest;
}

function resetGame() {
	clients = [];
	servers = [];
	messages = [];
	attackers = [];
	clientsServed = 0;
	droppedConnections = 0;
	failedConnections = 0;
	avgResponseTime = 0;
	sched = new Scheduler();
	sched.createServer("c");
	popularity = 0;
	elapsedTime = 0;
	nextUpgrade = 0;
	upgradesAvailable = 0;
	fader.emptyQueues();
	switchMode(gameModes.GAME);
}

function switchMode(mode) {
	currentGameMode = mode;
	buttons = [];
}

init();