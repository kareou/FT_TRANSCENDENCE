export class PlayerClassic{
	constructor(id, ctx,game_theme){
		this.id = id;
		this.x = id === 0 ? 40 : ctx.canvas.width - 50;
		this.width = 10;
		this.y = ctx.canvas.height / 2 - 50;
		this.height = 100;
		this.color = "white";
		this.power = 5;
		this.speed = 10;
		this.velocityY = 0;
		this.ctx = ctx;
		this.score = 0;
		this.game_theme = game_theme;
		console.log(this.game_theme);
	}

	draw(){
		this.ctx.fillStyle = this.color;
		let new_y = this.y + this.velocityY;
		if(new_y > 0 && new_y < this.ctx.canvas.height - this.height){
			this.y = new_y;
		}
		let radius = (this.game_theme === "classic" ? 0 : 5);
		this.ctx.beginPath();
        this.ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        this.ctx.fill();
        this.ctx.closePath();
	}

	movePlayer(direction){
		if(direction === "up"){
			this.velocityY = -this.speed;
		}else if(direction === "down"){
			this.velocityY = this.speed;
		}
	}

	stopPlayer(){
		this.velocityY = 0;
	}

	resetPosition(){
		this.y = this.ctx.canvas.height / 2 - 50;
	}
}


export class PlayerTest extends PlayerClassic{
	constructor(id, ctx,game_theme){
		super(id, ctx,game_theme);
		this.color = "lightpink";
		this.power = 4;
		this.speed = 12;
		
	}
}

export class PlayerTest2 extends PlayerClassic{
	constructor(id, ctx,game_theme){
		super(id, ctx,game_theme);
		this.color = "red";
		this.power = 7;
		this.speed = 8;
	}
}
