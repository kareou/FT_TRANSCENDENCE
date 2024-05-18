import { PlayerClassic, PlayerTest } from "./game_objects/player.js";
import { Ball } from "./game_objects/ball.js";
import { Board } from "./game_objects/board.js";

export default class Game extends HTMLElement {
  constructor() {
    super();
    this.player1;
    this.player2;
    this.ball;
    this.board;
    this.theme = "mod";
  }
  connectedCallback() {
    this.render();
    this.#timeCountUp();
    const canvas = this.querySelector(".board");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    this.player1 = new PlayerClassic(0, ctx, this.theme);
    this.player2 = new PlayerClassic(1, ctx, this.theme);
    this.ball = new Ball(ctx, this.theme);
    this.board = new Board(ctx, this.theme);
    this.board.draw();
    this.#drawPaddles(ctx);
    this.ball.draw();
    document.addEventListener("keydown", this.#movePaddels.bind(this));
    document.addEventListener("keyup", (e) => {
      if (e.code == "KeyW" || e.code == "KeyS") this.player1.stopPlayer();
      else if (e.code == "ArrowUp" || e.code == "ArrowDown")
        this.player2.stopPlayer();
    });
    // this.#update(ctx);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#movePaddels);
  }

  render() {
    this.innerHTML = /*html*/ `
        <div class="game_container">
                <div class="game">
                    <div class="players">

                    <div class="p_info">
                        <img id="player_img" src="/public/assets/bg_img.png" alt="">
                        <h1>player_1</h1>
                        <h1 id="p1_score">0</h1>
                    </div>
                    <div class="slash">
                        <h1 class ="timer">
                        <label id="minutes">00</label>:<label id="seconds">00</label>
                        </h1>
                    </div>
                        <div class="p_info">
                            <h1 id="p2_score">0</h1>
                            <h1>player_2</h1>
                            <img id="player_img" src="/public/assets/bg_img.png" alt="">
                        </div>
                    </div>
                    <canvas class="board"></canvas>
                </div>
            </div>
        `;
  }

  #update(ctx) {
    requestAnimationFrame(() => this.#update(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.board.draw();
    this.#drawPaddles(ctx);
    this.ball.move(this.player1, this.player2);
    this.ball.draw();
    if (this.#marked(ctx)) {
      this.ball.resetPosition();
      this.player1.resetPosition();
      this.player2.resetPosition();
    }
  }

  #drawPaddles(ctx) {
    this.player1.draw();
    this.player2.draw();
  }

  #paddelReachTopBottom(paddel) {
    return paddel.y < 0 || paddel.y + paddel.height > 800;
  }

  #movePaddels(e) {
    if (e.code == "KeyW") this.player1.movePlayer("up");
    else if (e.code == "KeyS") this.player1.movePlayer("down");
    if (e.code == "ArrowUp") this.player2.movePlayer("up");
    else if (e.code == "ArrowDown") this.player2.movePlayer("down");
  }

  #marked(ctx) {
    if (this.ball.x - this.ball.size < 0) {
      this.player2.score++;
      document.getElementById("p2_score").innerText = this.player2.score;
      return true;
    } else if (this.ball.x + this.ball.size > ctx.canvas.width) {
      this.player1.score++;
      document.getElementById("p1_score").innerText = this.player1.score;
      return true;
    }
    return false;
  }

  #timeCountUp() {
    const min = document.getElementById("minutes");
    const sec = document.getElementById("seconds");
    let minutes = 0;
    let seconds = 0;
    setInterval(() => {
      seconds++;
      if (seconds === 60) {
        minutes++;
        seconds = 0;
      }
      min.innerText = minutes < 10 ? "0" + minutes : minutes;
      sec.innerText = seconds < 10 ? "0" + seconds : seconds;
    }, 1000);
  }
}

customElements.define("co-game", Game);
