//construction stuff
var WIDTH;
var HEIGHT;
var context;
var canvas;

//constants
var serverSize = 40;	//pixels (side)
var clientSize = 30;	//pixels (diameter)
var messageSize = 6;	//pixels (diameter)
var frameRate = 60;		//frames per second
var maxClientWaitTime = 9;	//seconds
var serversSpeed = 3.5;	//messages per second
var serversCapacity = 80; //messages
var gameModes = { MENU: 0, GAME: 1, GAMEOVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
var gameLength = 5; //minutes

//variables
var buttons = [];

//helpers
var game;
var sched;
var fader;
var fpsCounter;
var music;
var orchestrator;
var popularityTracker;
var upgradesTracker;
var cursor;
var ui;

var credits;
var menu;
var gameOver;
var pause;

var logActive = true;

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
				game.servers.push(new Server(WIDTH / 2, HEIGHT / 2));
				game.servers[0].capacity = 20;
			},
			run: function () { },
			draw: function () { }
		},
		{
			id: 1,
			texts: ["This is a DATACENTER.",
				"Its role is to send data to your clients.",
				"Click 'Next' to continue."],
			setup: function () {
				buttons.push(Tutorial.nextButton);
				buttons.push(Tutorial.homeButton);
			},
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
				buttons.push(Tutorial.nextButton);
				buttons.push(Tutorial.homeButton);
				game.clients.push(new Client(orchestrator, popularityTracker, WIDTH * 3 / 4, HEIGHT / 2, 10000));
				game.clients[0].life = -31;
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
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				if (game.clients[0].connectedTo !== undefined) {
					Tutorial.advance();
				}
				if (game.clients[0].life >= maxClientWaitTime - 1) {
					this.texts = ["Snap! You let too much time pass!",
						"Normally this would be bad for you, but this time you'll get a little help.",
						"Create a CONNECTION to continue."];
					game.clients[0].life = -31;
				}
				game.updateClients();
			},
			draw: function () { }
		},
		{
			id: 4,
			texts: ["Good job! Now your very first client is being served.",
				"You can see the REQUESTS and RESPONSES traveling along the connection.",
				"The POPULARITY measures how successful your service is being."],
			setup: function () {
				popularityTracker.popularity = 0;
				buttons.push(Tutorial.nextButton);
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);
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
				buttons.push(Tutorial.homeButton);
				game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT / 4, 10000));
				game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT * 3 / 4, 10000));
				game.clients[1].life = - 21;
				game.clients[2].life = - 21;
			},
			run: function () {
				if (game.servers[0].queue.length > game.servers[0].capacity / 2) {
					Tutorial.advance();
				}
				if (game.clients.length === 1) {
					this.texts = ["Snap! You let too much time pass!",
						"As you can see you lost 10 popularity each.",
						"Connect the two clients to continue."];
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT / 4, 10000));
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT * 3 / 4, 10000));
					game.clients[1].life = - 21;
					game.clients[2].life = - 21;
				}
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
				buttons.push(Tutorial.homeButton);
				document.addEventListener("keypress", Tutorial.listener);
			},
			run: function () {
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
					game.servers[0].speed += serversSpeed;
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
				buttons.push(Tutorial.homeButton);

				game.clients[0].messagesToSend = 2;
				game.clients[0].acksToReceive = 2;
				game.clients[1].messagesToSend = 6;
				game.clients[1].acksToReceive = 6;
				game.clients[2].messagesToSend = 10;
				game.clients[2].acksToReceive = 10;
				orchestrator.messages.forEach(function (message) {
					if (message.status === "ack") {
						message.receiver.acksToReceive += 1;
					}
					if (message.status === "queued" || message.status === "req") {
						message.sender.acksToReceive += 1;
					}
				});
			},
			run: function () {
				if (game.clients.length === 0 && buttons.length === 1) {
					buttons.push(Tutorial.nextButton);
				}
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
				buttons.push(Tutorial.homeButton);

				game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT / 3, 10000));
				game.clients.push(new Client(orchestrator, popularityTracker, WIDTH * 3 / 4, HEIGHT / 3, 10000));
				game.clients[0].life = - 21;
				game.clients[1].life = - 21;
				game.attackers.push(new Attacker(orchestrator, WIDTH / 2, HEIGHT * 3 / 4, 10000, game.servers[0]));
				game.attackers.push(new Attacker(orchestrator, WIDTH / 3, HEIGHT * 2 / 3, 10000, game.servers[0]));
				game.attackers.push(new Attacker(orchestrator, WIDTH * 2 / 3, HEIGHT * 2 / 3, 10000, game.servers[0]));

				document.addEventListener("keypress", Tutorial.listener);
			},
			run: function () {
				if (game.selectedClient) {
					game.selectedClient = undefined;
				}
				if (game.clients.length === 0) {
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT / 3, 10000));
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH * 3 / 4, HEIGHT / 3, 10000));
					game.clients[0].life = - 21;
					game.clients[1].life = - 21;
				}
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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

				var x1, y1, x2, y2, x3, y3;
				x1 = 250;
				y1 = y2 = y3 = HEIGHT / 2 + 150;
				buttons.push(new SpecialButton(x1, y1, 100, 100, "#333333", "white", 2, function () {
					game.servers.push(new Server(WIDTH / 2, HEIGHT / 4));
					game.servers[0].capacity = 20;
					Tutorial.advance();
				}, function (hovered) {
					var font = "45px monospace",
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
				buttons.push(Tutorial.homeButton);

				game.clients[0].life = - 21;
				game.clients[1].life = - 21;
			},
			run: function () {
				if (game.clients.length === 0) {
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH / 4, HEIGHT / 3, 10000));
					game.clients.push(new Client(orchestrator, popularityTracker, WIDTH * 3 / 4, HEIGHT / 3, 10000));
					game.clients[0].life = - 21;
					game.clients[1].life = - 21;
				}
				if (game.clients[0].connectedTo !== undefined && game.clients[1].connectedTo !== undefined) {
					Tutorial.advance();
				}
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
				buttons.push(new Button(WIDTH / 3, HEIGHT - 40, 120, 40, "New game", "#FFFFFF", resetGame));
				buttons.push(Tutorial.homeButton);
			},
			run: function () {
				orchestrator.updateMessages();
				game.update();
			},
			draw: function () {
				var font = "18px sans-serif",
					align = "start",
					baseline = "middle",
					color = "black";
				drawText(10, HEIGHT - 95, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

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
		setupGame();
		switchMode(gameModes.TUTORIAL);
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
		ui.buttons = buttons; //TODO: remove after porting
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
		buttons = [];
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

	fader = new TextFader(context);
	fpsCounter = new FpsCounter();
	music = new Audio("assets/music.mp3");

	setupGame();

	music.loop = true;
	//music.play();

	$clouds.createCloud(WIDTH / 4, HEIGHT / 4, 220);
	$clouds.createCloud(0 - WIDTH / 4, HEIGHT / 2, 220);
	$clouds.createCloud(WIDTH / 2, HEIGHT / 2, 220, 40);
	$clouds.createCloud(0 - WIDTH / 2, HEIGHT * 3 / 4, 220);
	$clouds.createCloud(WIDTH * 3 / 4, HEIGHT / 4, 220);
	$clouds.createCloud(0 - WIDTH * 3 / 4, HEIGHT / 2, 220);

	document.addEventListener("keypress", keyboardHandler);

	window.onblur = function () {
		if (game.currentGameMode === gameModes.GAME) {
			switchMode(gameModes.PAUSE);
		}
	};

	game.currentGameMode = gameModes.MENU;

	return setInterval(mainLoop, 1000 / frameRate);
}

function mainLoop() {
	function update(scene) {
		scene.update();
		buttons = scene.getButtons();
		ui.buttons = buttons;
		drawButtons();
	}
	// TODO: Remove after porting
	if (game.currentGameMode !== gameModes.TUTORIAL) {
		buttons = [];
	}
	switch (game.currentGameMode) {
		case gameModes.MENU:
			update(menu);
			break;
		case gameModes.GAME:
			gameLoop();
			break;
		case gameModes.GAMEOVER:
			update(gameOver);
			break;
		case gameModes.CREDITS:
			update(credits);
			break;
		case gameModes.PAUSE:
			update(pause);
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

	ui.buttons = buttons;
}

function gameLoop() {
	if (game.servers.length === 0) {
		sched.createServer('c');
	}
	orchestrator.updateMessages();
	game.update();
	fader.update(1 / frameRate);
	sched.schedule();

	var m = Math.floor(game.elapsedTime / 60);

	if (m === gameLength && game.clients.length === 0) {
		switchMode(gameModes.GAMEOVER);
		return;
	}

	drawGame();
}

function upgradeLoop() {
	function selectUpgrade() {
		upgradesTracker.selectUpgrade = undefined;
		upgradesTracker.upgradesAvailable -= 1;
		fader.removeFromPermanentQueue("upgrade");
		switchMode(gameModes.PAUSE);
	}
	if (buttons.length === 0) {
		buttons.push(new Button(WIDTH / 2, HEIGHT - 100, 120, 40, "Cancel", "#333333", function () {
			switchMode(gameModes.PAUSE);
		}));

		switch (upgradesTracker.selectedUpgrade) {
			case "speed":
				game.servers.forEach(function (server) {
					buttons.push(new BorderButton(server.x, server.y, serverSize, serverSize,
						"", "rgba(0,0,0,0)", "limeGreen", 2, function () {
							server.speed += 2;
							selectUpgrade();
						}))
				});
				break;
			case "capacity":
				game.servers.forEach(function (server) {
					buttons.push(new BorderButton(server.x, server.y, serverSize, serverSize,
						"", "rgba(0,0,0,0)", "limeGreen", 2, function () {
							server.capacity += serversCapacity;
							selectUpgrade();
						}))
				});
				break;
			case "server":
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("nw");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("n");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("ne");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("w");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("c");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT / 2),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("e");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 6), Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("sw");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH / 2), Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3), Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("s");
						selectUpgrade();
					}));
				buttons.push(new BorderButton(Math.floor(WIDTH * 5 / 6) + 1, Math.floor(HEIGHT * 5 / 6),
					Math.floor(WIDTH / 3) - 2, Math.floor(HEIGHT / 3) - 2,
					"", "#CCCCCC", "limeGreen", 1, function () {
						sched.createServer("se");
						selectUpgrade();
					}));
				break;
		}
	}

	drawUpgrade();
}

function drawGame() {
	const sc = game.selectedClient;
	clear();

	//draw a line connecting the selected client to the mouse pointer
	if (sc !== undefined) {
		drawLine(sc.x, sc.y, cursor.mouseX, cursor.mouseY, "lightBlue", 3);
		drawCircle(sc.x, sc.y, clientSize / 2 + 3, "lightBlue");
	}

	drawConnections();
	drawMessages();
	drawClients();
	drawAttackers();
	drawServers();
	drawUI();
}

function drawUpgrade() {
	clear();

	drawServers();
	drawButtons();

	var text;
	switch (upgradesTracker.selectedUpgrade) {
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

function keyboardHandler(event) {
	event.preventDefault();
	switch (event.keyCode) {
		// SPACEBAR
		case 32:
			if (game.currentGameMode === gameModes.GAME) {
				switchMode(gameModes.PAUSE);
			} else if (game.currentGameMode === gameModes.PAUSE) {
				switchMode(gameModes.GAME);
			}
	}
}

function drawServers() {
	game.servers.forEach(function (server) {
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
	game.clients.forEach(function (client) {
		var x = client.x,
			y = client.y;

		if (client.connectedTo === undefined) {
			if (client.connectedTo === undefined && client.life > maxClientWaitTime - 2) {
				drawCircle(x, y, clientSize / 2, "red", "fireBrick", 2);
			} else if (client.connectedTo === undefined && client.life > maxClientWaitTime - 3.5) {
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
	game.attackers.forEach(function (attacker) {
		var x = attacker.x,
			y = attacker.y;

		drawTriangle(x, y, clientSize * 2 / Math.sqrt(3), clientSize, "#333333", "black", 2);

		drawText(x, y + 5, "DoS", "bold 10px Arial", "center", "middle", "white");
	});
}

function drawConnections() {
	game.clients.forEach(function (client) {

		var x = client.x,
			y = client.y;

		if (client.connectedTo !== undefined) {
			drawLine(x, y, client.connectedTo.x, client.connectedTo.y, "darkGray", 1);
		}
	});

	game.attackers.forEach(function (attacker) {
		var x = attacker.x,
			y = attacker.y;

		if (attacker.connectedTo !== undefined) {
			drawLine(x, y, attacker.connectedTo.x, attacker.connectedTo.y, "dimGray", 1);
		}
	});
}

function drawMessages() {
	orchestrator.messages.forEach(function (m) {
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
	const mouseX = cursor.mouseX,
		mouseY = cursor.mouseY;

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
	drawText(10, HEIGHT - 14, "Popularity: " + popularityTracker.popularity, font, align, baseline, color);

	//bottom center
	align = "center";
	color = "darkGray";
	drawText(WIDTH / 2, HEIGHT - 14, "Press space to pause", font, align, baseline, color);

	if (upgradesTracker.upgradesAvailable > 0) {
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
	var remaining = Math.max(0, gameLength * 60 - game.elapsedTime);
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

function setupGame() {
	orchestrator = new MessageOrchestrator();
	upgradesTracker = new UpgradesTracker();
	popularityTracker = new PopularityTracker(fader, upgradesTracker);
	ui = new GameUI(music, canvas);
	game = new GameTracker(popularityTracker, ui);
	cursor = new CursorTracker(game, canvas, ui);
	sched = new Scheduler(popularityTracker, fader, orchestrator, canvas, game);

	const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, sched, fader);

	credits = new Credits(canvas, $clouds, game);
	menu = new Menu(canvas, $clouds, game, ui, Tutorial, newGame);
	gameOver = new GameOver(canvas, $clouds, game, orchestrator, popularityTracker, newGame);
	pause = new Pause(canvas, $clouds, game, upgradesTracker, ui, newGame);

	cursor.bind();
	fader.emptyQueues();
}

function resetGame() {
	setupGame();
	switchMode(gameModes.GAME);
}

function switchMode(mode) {
	game.switchMode(mode);
	buttons = [];
}

init();