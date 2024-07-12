export class Ball {

  constructor(ctx, theme) {
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;
    this.size = theme === 'classic' ? 7 : 10;
    this.speed = 4;
    this.dx = 4;
    this.dy = -4;
    this.ctx = ctx;
    this.theme = theme;
    this.color = this.theme === "sky" ? "#FDFD96" : "white";
  }

  draw() {
    this.ctx.fillStyle = this.color;
    if (this.theme === "classic") {
      this.ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    } else {

      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  move(player1, player2) {
    this.#hitWall();
    this.#detectPlayerCollision(player1, player2);
    this.x += this.dx;
    this.y += this.dy;
  }
  #hitWall() {
    if (this.y + this.size > this.ctx.canvas.height || this.y - this.size < 0) {
      this.dy = -this.dy;
    }
  }
  #hiteplayer(player) {
    this.speed = player.power;
    this.dx = this.dx < 0 ? -this.speed : this.speed;
    this.dy = this.dy < 0 ? -this.speed : this.speed;
    this.dx = -this.dx;
  }

  #detectPlayerCollision(player1, player2) {
    if (this.dx > 0) {
      let player = player2;
      if (
        this.x + this.size > player.x &&
        this.y > player.y &&
        this.y < player.y + player.height
      ) {
        // this.x = player.x - this.size;
        this.#hiteplayer(player);
      }
    } else {
      let player = player1;
      if (
        this.x - this.size < player.x + player.width &&
        this.y > player.y &&
        this.y < player.y + player.height
      ) {
        // this.x = player.x + player.width + this.size;
        this.#hiteplayer(player);
      }
    }
  }
  resetPosition() {
    this.x = this.ctx.canvas.width / 2;
    this.y = this.ctx.canvas.height / 2;
    this.dx = 4;
    this.dy = -4;
  }
}
