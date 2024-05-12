export class Player{
	constructor(id, ctx){
		this.id = id;
		this.x = id === 1 ? 10 : ctx.canvas.width - 60;
		this.y = ctx.canvas.height / 2 - 25;
		this.width = 10;
		this.height = 100;
		this.color = "red";
		this.power = 5;
		this.speed = 5;
		this.ctx = ctx;
	}
}
