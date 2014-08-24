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
	return window.cancelAnimationFrame ||
	window.webkitCancelRequestAnimationFrame || 
	window.mozCancelRequestAnimationFrame || 
	window.oCancelRequestAnimationFrame || 
	window.msCancelRequestAnimationFrame || 
	clearTimeout 
})();

var isPaused = false;

//Initializing canvas and ctx
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"), //with ctx we can draw and handle things in the canvas
	WIDTH = 500, // Window's width 
	HEIGHT = 450, // Window's height
	keystate = {}, //Store the value of the keybord key when pressed 
	leftArrow   = 37, //Keyboard left arrow key
	rightArrow = 39, //keyboard right arrow key
	spaceBar = 32;  //Keyboard space bar key


var ball = {
	x: null,
	y: null,
	side: 10,
	vel: null,
	speed: 9,
	draw: function() {
		//function to draw the ball in canvas
		//Start drawing
		ctx.beginPath();
		///position and form
		ctx.arc(this.x, this.y, this.side/2, 0, Math.PI*2, false); //start angle = 0, end angle = PI*2 (angle of a circle.), anti-clockwise = false 
		ctx.fill();
	},
	init: function(dir){
		
		var r = Math.random();

		// set the x and y position
		this.y = player.y+player.height;
		this.x = (WIDTH - this.side)*r;

		// steeper angle
		var phi = 0.1*Math.PI*(1 - 2*r);
		
		// set velocity direction and magnitude
		this.vel = {
			y: dir*this.speed*Math.cos(phi),
			x: this.speed*Math.sin(phi)
		}
	},
	update: function() {
		//move the ball
		this.x += this.vel.x;
		this.y += this.vel.y;


		//Out of X
		if(this.x + this.side > WIDTH || this.x - ball.side < 0) {
			this.vel.x = -this.vel.x;
		}

		//Collision
		var Collision = function(ax, ay, aw, ah, bx, by, bw, bh){
			return ay < by+bh && ax < bx+bw && by < ay+ah && bx < ax +aw;
		}
		var p = this.vel.y < 0 ? ai : player;

		if (Collision(p.x, p.y, p.width, p.height, this.x, this.y, this.side, this.side)){

			pi = Math.PI;
			this.y = p===player ? player.y+player.height : ai.y - this.side;
			var n = (this.x+this.side - p.x)/(p.width+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45
			// calculate smash value and update velocity
			var smash = Math.abs(phi) > 0.2*pi ? 1 : 1.5;

			this.vel.y = smash*(p===player ? -1 : 1)*this.speed*Math.cos(phi);
			this.vel.x = smash*this.speed*Math.sin(phi);
		}

		//Out of y
		if (0 > this.y+this.side || this.y > HEIGHT){
		
			//Who scored?
			var p = this.vel.y < 0 ? player : ai;
			point(p);

		}

		
	}

};

var player = {
	x: null,
	y: null,
	speed: 10,
	height:  10,
	width: 120,
	score: 0,

	update: function() {
		if (keystate[leftArrow]) this.x -= this.speed;
		if (keystate[rightArrow]) this.x += this.speed;

		// keep the paddle inside of the canvas, set a max and minimum position
		this.x = Math.max(Math.min(this.x, WIDTH - this.width), 0);
	},
	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

var ai = {
	x: null,
	y: null,
	height:  10,
	width: 120,
	score: 0,

	update: function() {
		// calculate ideal position
		var desty = ball.x - (this.width - ball.side)*0.5;
		// ease the movement towards the ideal position
		this.x += (desty - this.x) * 0.075;
		// keep the paddle inside of the canvas
		this.x = Math.max(Math.min(this.x, WIDTH - this.width), 0);
	},

	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

function main() {

	//Set canvas width and height
	canvas.width = WIDTH; 
	canvas.height = HEIGHT;	

	// keep track of keyboard presses
	document.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete keystate[evt.keyCode];
	});

	//Set player position
	player.y = (HEIGHT-player.height)-2;
	player.x = WIDTH/2 - player.width/2;
	
	//set cpu position
	ai.y = 2;
	ai.x = WIDTH/2 - player.width/2;

	//Serve the ball
	ball.init(-1);


	// game loop function
	animationLoop();


}


//Draw objects on canvas 
function draw() {
	var img = new Image();

	img.src = "images/triangular.png";
	img.onload = function () {
	var pattern = ctx.createPattern(img, "repeat");

	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	};

	ctx.save();

	//Now start drawing white
	ctx.fillStyle = "#fff";

	ai.draw();
	player.draw();
	ball.draw();



}

//running animations
function animationLoop() {
	//every frame, call this function
	init = requestAnimFrame(animationLoop); 
	draw();
	update();
}

//Function to update ball and paddles positions, score, it's called on every frame...
function update() {


	if (!isPaused) ball.update();
	player.update();
	ai.update();

	if (isPaused){
		ctx.fillStyle = "white"; 
		ctx.font = "40px Arial, sans-serif"; 
		ctx.textAlign = "center"; 
		ctx.textBaseline = "middle"; 
		ctx.fillText(ai.score+" - "+player.score, WIDTH/2, HEIGHT/2 - 25);
		ctx.font = "10px Arial, sans-serif"; 
		ctx.fillText("PRESS SPACE BAR TO SERVE", WIDTH/2, HEIGHT/2);
	} 

	if (isPaused && keystate[spaceBar]){
		ball.init(-1);
		isPaused = false;		
	}


}


function point(p){
	//ball.y = null;
	//ball.x = null;

	p.score++;
	isPaused = true;
}



main();
