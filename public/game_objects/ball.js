export class Ball{
	theme = {
		"8ball": "black",
		"beach": "blue",
	};
	constructor(ctx,theme){
		this.x = ctx.canvas.width / 2;
		this.y = ctx.canvas.height / 2;
		this.size = 10;
		this.speed = 4;
		this.dx = 4;
		this.dy = -4;
		this.ctx = ctx;
		this.color = this.theme[theme] || "black";
	}

	draw(){
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
	}

	move(){
		this.x += this.dx;
		this.y += this.dy;
	}
	hitWall(){
		if(this.y + this.size > this.ctx.canvas.height || this.y - this.size < 0){
			this.dy = -this.dy;
		}
	}
	hiteplayer(player){
		this.speed = player.power;
		this.dx = this.dx < 0 ? -this.speed : this.speed;
		this.dy = this.dy < 0 ? -this.speed : this.speed;
		this.dx = -this.dx;
	}
}
