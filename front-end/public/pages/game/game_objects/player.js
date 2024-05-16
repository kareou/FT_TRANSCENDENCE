export class PlayerClassic{
	constructor(id, ctx){
		this.id = id;
		this.x = id === 0 ? 10 : ctx.canvas.width - 20;
		this.width = 10;
		this.y = ctx.canvas.height / 2 - 50;
		this.height = 100;
		this.color = "white";
		this.power = 5;
		this.speed = 10;
		this.velocityY = 0;
		this.ctx = ctx;
		this.score = 0;
	}

	draw(){
		this.ctx.fillStyle = this.color;
		let new_y = this.y + this.velocityY;
		if(new_y > 0 && new_y < this.ctx.canvas.height - this.height){
			this.y = new_y;
		}
		this.ctx.beginPath();
        this.ctx.roundRect(this.x, this.y, this.width, this.height,5);
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
	constructor(id, ctx){
		super(id, ctx);
		this.color = "lightpink";
		this.power = 1;
	}
}

export class PlayerTest2 extends PlayerClassic{
	constructor(id, ctx){
		super(id, ctx);
		this.color = "red";
		this.power = 10;
	}
}

export class PlayerTest3 extends PlayerClassic{
	constructor(id, ctx){
		super(id, ctx);
		this.color = "green";
		this.power = 15;
	}
}
