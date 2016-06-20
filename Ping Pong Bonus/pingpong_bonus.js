// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     ||  
		function( callback ){
			return window.setTimeout(callback, 1000 / 60);
		};
})();

window.cancelRequestAnimFrame = ( function() {
	return window.cancelAnimationFrame          ||
		window.webkitCancelRequestAnimationFrame    ||
		window.mozCancelRequestAnimationFrame       ||
		window.oCancelRequestAnimationFrame     ||
		window.msCancelRequestAnimationFrame        ||
		clearTimeout
} )();


// Initialize canvas and required variables
var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"), // Create canvas context
		W = window.innerWidth, // Window's width
		H = window.innerHeight, // Window's height
		particles = [], // Array containing particles
		ball = {}, // Ball object
		paddles = [2], // Array containing two paddles
		mouse = {}, // Mouse object to store it's current position
		upPressed = false,
                downPressed = false,
                pointsA = 0, // Varialbe to store points
                pointsB = 0,
		startBtn = {}, // Start button object
		restartBtn = {}, // Restart button object
		flag = 0, // flag variable to alternate between the two paddles
                over = 0, // flag varialbe, changed when the game is over
		init, // variable to initialize animation
		paddleHit;

// Add keyboardmove and mousedown events to the canvas
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("mousedown", btnClick, true);

// Initialise the collision sound
collision = document.getElementById("collide");

// Set the canvas's height and width to full screen
canvas.width = W;
canvas.height = H;

// Function to paint canvas
function paintCanvas() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
}

// Function for creating paddles
function Paddle(pos) {
	// Height and width
	this.w = 5;
	this.h = 150;
	
	// Paddle's position
	this.y = H/2 - this.h/2;
	this.x = (pos == "left") ? 0 : W - this.w;
	
}

// Push two new paddles into the paddles[] array
paddles.push(new Paddle("right"));
paddles.push(new Paddle("left"));

// Ball object
ball = {
	x: 50,
	y: 50, 
	r: 5,
	c: "white",
	vx: 4,
	vy: 8,
	
	// Function for drawing ball on canvas
	draw: function() {
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
		ctx.fill();
	}
};


// Start Button object
startBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 25,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "white";
		ctx.fillText("Start", W/2, H/2 );
	}
};

// Restart Button object
restartBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 50,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "white";
		ctx.fillText("Restart", W/2, H/2 - 25 );
	}
};

// Draw everything on canvas
function draw() {
	paintCanvas();
	for(var i = 0; i < paddles.length; i++) {
		p = paddles[i];
		
		ctx.fillStyle = "white";
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}
	
	ball.draw();
	update();
}

// Function to increase speed after every 5 points
function increaseSpd() {
	if((pointsA + pointsB) % 6 == 0) {
		if(Math.abs(ball.vx) < 15) {
			ball.vx += (ball.vx < 0) ? -2 : 2;
			ball.vy += (ball.vy < 0) ? -1 : 1;
		}
	}
}

// Keyboard controls
function keyDownHandler(e) {
    if(e.keyCode == 38) {
        upPressed = true;
    }
    else if(e.keyCode == 40) {
        downPressed = true;
    }
}

    function keyUpHandler(e) {
    if(e.keyCode == 38) {
        upPressed = false;
    }
    else if(e.keyCode == 40) {
        downPressed = false;
    }
}

// Function to update positions, score and everything.
// Basically, the main game logic is defined here
function update() {
	
	// Update scores
	updateScore(); 
	
	// Move the paddles using keyboard
        if ( flag ==0 ){
              if(downPressed && paddles[1].y < H - paddles[1].h) {
	            p = paddles[1];
                    p.y += 10;
               }
              else if(upPressed && paddles[1].y > 0) {
	            p = paddles[1];
                    p.y -= 10;
               }
         }
	else
        {
              if(downPressed && paddles[2].y < H - paddles[2].h) {
	            p = paddles[2];
                    p.y += 10;1
               }
              else if(upPressed && paddles[2].y > 0) {
                    p = paddles[2];
                    p.y -= 10;
               }
         }
	// Move the ball
	ball.x += ball.vx;
	ball.y += ball.vy;
	
	// Collision with paddles
	p1 = paddles[1];
	p2 = paddles[2];
	
	// If the ball strikes with paddles,
	// invert the y-velocity vector of ball,
	// increment the points, play the collision sound,
	// save collision's position so that sparks can be
	// emitted from that position, set the flag variable,
	// and change the multiplier
	if(collides(ball, p1)) {
		collideAction(ball, p1);
                pointsB++;
                flag = 1;
	}
	
	
	else if(collides(ball, p2)) {
		collideAction(ball, p2);
                pointsA++;
                flag = 0;
	} 
	
	else {
		// Collide with walls, If the ball hits the left/right walls, run gameOver() function
		if(ball.x + ball.r > W) {
			ball.x = W - ball.r;
			gameOver();
		} 
		
		else if(ball.x < 0) {
			ball.x = ball.r;
			gameOver();
		}
		
		// If ball strikes the horizontal walls, invert the x-velocity vector of ball
		if(ball.y + ball.r > H) {
			ball.vy = -ball.vy;
			ball.y = H - ball.r;
		}
		
		else if(ball.y -ball.r < 0) {
			ball.vy = -ball.vy;
			ball.y = ball.r;
		}
	}
}
//Function to check collision between ball and one of the paddles
function collides(b, p) {
	if(b.y + ball.r >= p.y && b.y - ball.r <=p.y + p.h) {
		if(b.x >= (p.x - p.w) && p.x > 0){
			paddleHit = 1;
			return true;
		}
		
		else if(b.x - ball.r <= p.w && p.x == 0) {
			paddleHit = 2;
			return true;
		}
		
		else return false;
	}
}

//Do this when collides == true
function collideAction(ball, p) {
	ball.vx = -ball.vx;
	
	if(paddleHit == 1) {
		ball.x = p.x - p.w;
		}
	
	else if(paddleHit == 2) {
		ball.x = p.w + ball.r;
		}
	
	increaseSpd();
	
	if(collision) {
		if(pointsA >0 && pointsB > 0) 
			collision.pause();
		
		collision.currentTime = 0;
		collision.play();
	}
}

// Function for updating score
function updateScore() {
	ctx.fillStlye = "white";
	ctx.font = "16px Arial, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + pointsA + ":" + pointsB, 20, 20 );
}

// Function to run when the game overs
function gameOver() {
	ctx.fillStlye = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	if (pointsB > pointsA)
  {
   ctx.fillText("Game Over - B wins! ", W/2, H/2 + 25 );
  }
  if ( pointsA == pointsB)
  {
   ctx.fillText("Game Over - A wins! ", W/2, H/2 + 25 );
  }
        // Stop the Animation
	cancelRequestAnimFrame(init);
	
	// Set the over flag
	over = 1;
	
        // Reset flag
        flag = 0;
  
	// Show the restart button
	restartBtn.draw();
}

// Function for running the whole animation
function animloop() {
	init = requestAnimFrame(animloop);
	draw();
}

// Function to execute at startup
function startScreen() {
	draw();
	startBtn.draw();
}

// On button click (Restart and start)
function btnClick(e) {
	
	// Variables for storing mouse position on click
	var mx = e.pageX,
			my = e.pageY;
	
	// Click start button
	if(mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
		animloop();
		
		// Delete the start button after clicking it
		startBtn = {};
	}
	
	// If the game is over, and the restart button is clicked
	if(over == 1) {
		if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
			ball.x = 20;
			ball.y = 20;
			pointsA = 0;
                        pointsB = 0;
			ball.vx = 4;
			ball.vy = 8;
                        paddles[1].x = W - 5;
                        paddles[1].y = H/2 - 75;
                        paddles[2].x = 0;
                        paddles[2].y= H/2 - 75;
			animloop();
			
			over = 0;
		}
	}
}

// Show the start screen
startScreen();