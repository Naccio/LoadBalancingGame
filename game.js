//construction stuff
var WIDTH;
var HEIGHT;
var context;
var canvas;

//constants
var frameRate = 60;		//frames per second
var gameModes = { MENU: 0, GAME: 1, GAMEOVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };

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
var tutorial;

var logActive = true;

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
			game.switchMode(gameModes.PAUSE);
		}
	};

	return setInterval(mainLoop, 1000 / frameRate);
}

function mainLoop() {
	function update(scene) {
		scene.update();
		ui.buttons = scene.getButtons();
		drawButtons();
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
			update(tutorial);
			break;
	}

	if (logActive) {
		fpsCounter.update();
		fpsCounter.logFps();
	}
}

function keyboardHandler(event) {
	event.preventDefault();
	switch (event.keyCode) {
		// SPACEBAR
		case 32:
			if (game.currentGameMode === gameModes.GAME) {
				game.switchMode(gameModes.PAUSE);
			} else if (game.currentGameMode === gameModes.PAUSE) {
				game.switchMode(gameModes.GAME);
			}
	}
}

function drawButtons() {
	const mouseX = cursor.mouseX,
		mouseY = cursor.mouseY;

	ui.buttons.forEach(function (button) {
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
	gameOver = new GameOver(canvas, $clouds, game, orchestrator, popularityTracker, newGame);
	pause = new Pause(canvas, $clouds, game, upgradesTracker, ui, newGame);
	upgrade = new Upgrade(canvas, game, upgradesTracker, sched, gameArea, fader);
	gameScene = new Game(canvas, game, sched, orchestrator, gameArea, fader);
	tutorial = new Tutorial([
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
	], canvas, gameArea, fader, game, orchestrator);
	menu = new Menu(canvas, $clouds, game, ui, tutorial, newGame);

	cursor.bind();
}

init();