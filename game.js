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
		buttons = this.currentStep.extraButtons ?? [];
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
		if (this.currentStep.advanceOnSpace) {
			document.removeEventListener('keypress', this.listener);
		}
		buttons = [];
		this.currentStep = this.steps[this.currentStep.id + 1];
		this.currentStep.setup();
		if (this.currentStep.advanceOnSpace) {
			document.addEventListener('keypress', this.listener);
		}
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
		new TutorialStep6(canvas, game, orchestrator, popularityTracker),
		new TutorialStep7(canvas, game, orchestrator, popularityTracker),
		new TutorialStep8(canvas, game, orchestrator, popularityTracker, fader),
		new TutorialStep9(canvas, game, fader),
		new TutorialStep10(canvas, game, orchestrator, popularityTracker),
		new TutorialStep11(canvas, game, orchestrator, popularityTracker, fader),
		new TutorialStep12(canvas, game, fader),
		new TutorialStep13(canvas, game, orchestrator, popularityTracker),
		new TutorialStep14(canvas, game, orchestrator, popularityTracker, newGame)
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