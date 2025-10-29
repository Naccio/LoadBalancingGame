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
var gameArea;

//scenes
var credits;
var menu;
var gameOver;
var pause;
var upgrade;
var gameScene;

var logActive = true;

var Tutorial = {
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
		buttons = [];
		this.currentStep.run();
		fader.update(1 / frameRate);
		if (this.currentStep.hasNext) {
			buttons.push(this.nextButton);
		}
		if (this.currentStep.hasHome) {
			buttons.push(this.homeButton);
		}
		ui.buttons = buttons; //TODO: remove after porting
		this.draw();

		if (this.currentStep.advance) {
			this.advance();
		}
	},
	draw: function () {
		clear();
		gameArea.draw();
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
			update(gameScene);
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
			update(upgrade);
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

function setupGame() {
	orchestrator = new MessageOrchestrator();
	upgradesTracker = new UpgradesTracker();
	popularityTracker = new PopularityTracker(fader, upgradesTracker);
	ui = new GameUI(music, canvas);
	game = new GameTracker(popularityTracker, ui);
	cursor = new CursorTracker(game, canvas, ui);
	sched = new Scheduler(popularityTracker, fader, orchestrator, canvas, game);
	gameArea = new GameArea(canvas, game, orchestrator, popularityTracker, upgradesTracker, cursor, fader);

	const newGame = new NewGame(orchestrator, upgradesTracker, popularityTracker, game, sched, fader);

	credits = new Credits(canvas, $clouds, game);
	menu = new Menu(canvas, $clouds, game, ui, Tutorial, newGame);
	gameOver = new GameOver(canvas, $clouds, game, orchestrator, popularityTracker, newGame);
	pause = new Pause(canvas, $clouds, game, upgradesTracker, ui, newGame);
	upgrade = new Upgrade(canvas, game, upgradesTracker, sched, gameArea, fader);
	gameScene = new Game(canvas, game, sched, orchestrator, gameArea, fader);

	Tutorial.steps = [
		new TutorialStep1(canvas, game),
		new TutorialStep2(canvas),
		new TutorialStep3(canvas, game, orchestrator, popularityTracker),
		new TutorialStep4(game),
		new TutorialStep5(canvas, game, orchestrator, popularityTracker),
		{
			id: 5,
			hasHome: true,
			texts: ["Cool! Two new clients want to use your service!",
				"Connect them as well to start gaining some more popularity.",
				"Remember, if you wait too much, you will lose popularity!"],
			setup: function () {
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
			hasNext: true,
			hasHome: true,
			texts: ["Oh no! Looks like your datacenter can't handle all this traffic!",
				"Clients will not be pleased if your datacenter is too busy to reply.",
				"You can see how busy a datacenter is by looking at its status bar."],
			setup: function () { },
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
			hasHome: true,
			texts: ["Thankfully, you are popular enough to afford to UPGRADE your datacenter.",
				"As your popularity grows, you will be able to upgrade it even more.",
				"Press SPACE to pause the game and select an upgrade."],
			setup: function () {
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
			hasHome: true,
			texts: ["Nice! You can see your datacenter's speed in the bottom left of it.",
				"Now the clients can finish their data exchange without any more problems.",
				"When a client is served successfully you will gain some more popularity."],
			setup: function () {
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
				if (game.clients.length === 0) {
					this.hasNext = true;
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
			hasHome: true,
			texts: ["Snap! Your datacenter is under a DDOS ATTACK! And more clients need serving!",
				"This is likely to happen as you get more and more popular.",
				"You'd better upgrade once again to cope with this situation."],
			setup: function () {
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
			hasHome: true,
			texts: ["Perfect! Now you have a new datacenter at your disposal.",
				"This is when a good load balancing strategy will start to matter.",
				"Indeed you would be wiser to connect the clients to the new datacenter."],
			setup: function () {
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
			hasHome: true,
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
	];

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