export class Board {
  constructor(ctx, theme) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.theme = theme;
  }
  draw() {
    if (this.theme === "classic") {
      this.#drawClassicBoard();
    } else if (this.theme === "mod") {
      this.#drawModTable();
    } else if (this.theme === "sky") {
      this.#drawSkyTable();
    }
  }
  #drawClassicBoard() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 10;
    this.ctx.setLineDash([40, 40]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.ctx.canvas.width / 2, 10);
    this.ctx.lineTo(this.ctx.canvas.width / 2, this.ctx.canvas.height);
    this.ctx.stroke();
  }

  #drawModTable() {
    this.ctx.fillStyle = "#222831";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "#474747";
    this.ctx.fillRect(this.ctx.canvas.width / 2 - 5, 0, 10, this.ctx.canvas.height);
  }

  #drawSkyTable() {
    this.ctx.fillStyle = "#123243";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    var xMax = this.ctx.canvas.width;
    var yMax = this.ctx.canvas.height;
    var hmTimes = Math.round(xMax + yMax);

    for (var i = 0; i <= hmTimes; i++) {
      var randomX = Math.floor(Math.random() * xMax + 1);
      var randomY = Math.floor(Math.random() * yMax + 1);
      var randomSize = Math.floor(Math.random() * 2 + 1);
      var randomOpacityOne = Math.floor(Math.random() * 9 + 1);
      var randomOpacityTwo = Math.floor(Math.random() * 9 + 1);
      var randomHue = Math.floor(Math.random() * 360 + 1);
      if (randomSize > 1) {
        this.ctx.shadowBlur = Math.floor(Math.random() * 10 + 5);
        this.ctx.shadowColor = "white";
      }
      this.ctx.fillStyle =
        "hsla(" +
        randomHue +
        ", 30%, 80%, ." +
        randomOpacityOne +
        randomOpacityTwo +
        ")";
      this.ctx.fillRect(randomX, randomY, randomSize, randomSize);
    }
    this.ctx.fillStyle = "#474747";
    this.ctx.fillRect(this.ctx.canvas.width / 2 - 5, 0, 10, this.ctx.canvas.height);
  }
}
