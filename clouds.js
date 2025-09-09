/**
    This library is based on Cloudgen.js by Benjamin Parker
    (https://github.com/Ninjakannon/Cloudgen.js)
*/

// Hide internals from the global scope in an anonymous function.
(function () {
	// Constants =============================================================
	// We require this later, so precompute it here.
	var TWO_PI = Math.PI * 2;

	// The ratio of circle radius to cloud radius. The circles used to draw
	// the clouds are thus this times the cloud radius.
	var CIRCLE_RADIUS_RATIO = 0.6;
	
	// Returns a random integer between two numbers
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	// Setup =================================================================
	// Create our local Clouds.js object.
	var Clouds = function () {
	};

	var clouds = [];
	var wind = 0;
    var sky = "rgba(0,0,0,0)";
    var autoUpdate = true;
	
	// Public Methods ========================================================
    
	/* Sets the the wind direction.
	   w (required)
		    direction at which the wind blows, expressed as an angle
            in radians. */
	Clouds.setWind = function (w) {
		wind = w;
	};
    
	/* Sets the the wind direction.
	   wc (required)
		    a string containing the sky colour (e.g. "#424242",
            "rgba(42,42,42,.42)") */
	Clouds.setSkyColour = function (c) {
		sky = c;
	};
    
	/* Sets wether the library automatically updates the clouds'
    positions every time the draw function is called.
	   au (required)
		    a boolean indicating if calling update() after each draw() */
	Clouds.setAutoUpdate = function (au) {
		autoUpdate = au;
	};
	
	/* Creates a new cloud
      x (optional) Default 0.
          The center of the cloud in x dimension.
				 
      y (optional) Default 0.
          The center of the cloud in x dimension.

      radius (optional) Default a random integer between 100 and 200.
          The radius of the circular area inside which the cloud will be
          generated.

      circles (optional) Default a random integer between 30 and 50.
          Clouds are created by drawing numerous gradient-filled circles;
          the more there are, the thicker the cloud. This is the number to
          draw.

      colour (optional) Default {r:n, g:n, b:n, a:0} with 180 <= n <= 255.
          An object of the form {r:0, g:0, b:0, a:0} representing the RGBA values
          of the cloud colour.
				 
      speed (optional) Default a random number between 1 and 3
          The speed at which the cloud gets moved by the wind. */
	Clouds.createCloud = function (x, y, radius, circles, colour, speed) {
		// Set default arguments.
		switch (arguments.length) {
		case 0:
			x = 0;
		case 1:
			y = 0;
		case 2:
			radius = getRandomInt(100, 200);
		case 3:
			circles = getRandomInt(25, 40);
		case 4:
			var n = getRandomInt(180, 255);
			colour = {r: n, g: n, b: n, a: 0.1};
		case 5:
			speed = Math.random() * 3 + 1;
		}
		var cloud = {
			x : x,
			y : y,
			speed : speed,
			radius : radius,
			colour : colour,
			seed : [],
            circleCanvas : null
		};
		
		for (var i = 0; i < circles; i++) {
			// Compute a randomised circle position within the cloud.
			cloud.seed[i] = {
				x : Math.random(),
				y : Math.random(),
				a : Math.random() * TWO_PI
			};
		}
        
        var circleRadius = cloud.radius * CIRCLE_RADIUS_RATIO;

        // Create the circle's radial gradient.
        var gradient = context.createRadialGradient(circleRadius, circleRadius, 0, circleRadius, circleRadius, circleRadius);
        var gradientColour = "rgba(" + cloud.colour.r + ", " + cloud.colour.g + ", " + cloud.colour.b + ", ";

        gradient.addColorStop(0, gradientColour + cloud.colour.a + ")");
        gradient.addColorStop(1, gradientColour + "0)");

        // Draw the circle with gradient to a canvas.
        var circleCanvas = document.createElement("canvas");
        var circleCanvasContext = circleCanvas.getContext("2d");

        circleCanvas.width = circleRadius * 2;
        circleCanvas.height = circleCanvas.width;

        circleCanvasContext.fillStyle = gradient;

        circleCanvasContext.beginPath();
        circleCanvasContext.arc(circleRadius, circleRadius, circleRadius, 0, TWO_PI, true);
        circleCanvasContext.fill();
        
        cloud.circleCanvas = circleCanvas;
		
		clouds.push(cloud);
	};
	
	/* Draws all the clouds. Beware that, if your sky colour is fully or partially
    transparent, you will need to clear the canvas before redrawing.
      context (required)
          The "CanvasRenderingContext2D" instance to draw to. */	
	Clouds.draw = function(context) {
    	context.fillStyle = sky;
    	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
		clouds.forEach(function(cloud) {
            var circleRadius = cloud.radius * CIRCLE_RADIUS_RATIO;
            
			cloud.seed.forEach(function(seed) {
				var x = cloud.x - circleRadius + seed.x * cloud.radius * Math.cos(seed.a);
				var y = cloud.y - circleRadius + seed.y * cloud.radius * Math.sin(seed.a);

				// Draw the circle.
				context.drawImage(cloud.circleCanvas, x, y);
			});
		});
			
      if(autoUpdate) {
        Clouds.update(context);
      }
    };
	
	/* Updates all clouds' positions according to the wind direction and the clouds' speeds
      context (required)
          The "CanvasRenderingContext2D" instance where the clouds are drawn.
          If a cloud's new position would put it outside of the context's canvas,
          it will be moved on the opposite side. */	
	Clouds.update = function(context) {
		clouds.forEach(function(cloud) {
			var dx = Math.cos(wind) * cloud.speed,
                dy = Math.sin(wind) * cloud.speed,
                rad = cloud.radius * 1.5,
                w = context.canvas.width,
                h = context.canvas.height;
			
			cloud.x += dx;
			if (dx > 0 && cloud.x - rad > w) {
				cloud.x = 0 - rad;
			} else if (dx < 0 && cloud.x + rad < 0) {
				cloud.x = w + rad;
			}
			cloud.y += dy;
			if (dy > 0 && cloud.y - rad > h) {
				cloud.y = 0 - rad;
			} else if (dy < 0 && cloud.y + rad < 0) {
				cloud.y = h + rad;
			}
		});
	};


	// Finalisation ==========================================================
	// Expose Clouds.js to the global scope.
	window.$clouds = Clouds;
})();