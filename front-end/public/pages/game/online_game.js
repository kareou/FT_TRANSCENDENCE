import { PlayerClassic, PlayerTest } from "./game_objects/player.js";
import { Ball } from "./game_objects/ball.js";

export default class OnlineGame extends HTMLElement {
  constructor() {
    super();
    this.player1 = null;
    this.player2 = null;
    this.ball;
    this.websocket = null;
    this.role = null;
    this.game_id = null;
    this.game_started = false;
  }

  connectedCallback() {
    this.websocket = new WebSocket("ws://localhost:8000/ws/gamematch/game/");
    this.render();
    this.#timeCountUp();
    const canvas = this.querySelector(".board");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    this.websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.role) {
        this.role = data.role;
        this.game_id = data.game_id;
      }
      if (data.move) {
        this.#updatePaddels(data);
      }
      if (data.message) {
        if (data.message === "Game is starting") {
          this.game_started = true;
          this.#update(ctx);
        }
      }
    };
    this.player1 = new PlayerClassic(0, ctx);
    this.player2 = new PlayerTest(1, ctx);
    this.ball = new Ball(ctx, "beach");
    this.#drawBoard(ctx);
    this.#drawPaddles(ctx);
    this.ball.draw();
    document.addEventListener("keydown", this.#movePaddels.bind(this));
    document.addEventListener("keyup", (e) => {
      if (e.code == "KeyW" || e.code == "KeyS") {
        if (this.player1) this.player1.stopPlayer();
        else this.player2.stopPlayer();
        this.websocket.send(JSON.stringify({ move: "stop" }));
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#movePaddels);
    this.websocket.close();
  }

  render() {
    this.innerHTML = /*html*/ `
    <div class="game_container">
    <div class="game">
        <div class="player_1">
            <div class="p_info">
                <img id="player_img" src="/public/assets/bg_img.png" alt="">
                <h1>player_1</h1>
            </div>
            <h1 id="p1_score">0</h1>
        </div>
        <canvas class="board"></canvas>
        <div class="player_2" >
            <div class="p_info">
                <img id="player_img" src="/public/assets/bg_img.png" alt="">
                <h1>player_2</h1>
            </div>
            <h1 id="p2_score">0</h1>
        </div>
    </div>
    <div class="chat_tab">
        <div class="stats">
            <h1>
                Time: <label id="minutes">00</label>:<label id="seconds">00</label> 
            </h1>
        </div>
        <div class="chating_area"></div>
        <div class="message_input">
            <input type="text" placeholder="your message">
            <i class="fa-solid fa-paper-plane-top"></i>
        </div>
    </div>
</div>
    `;
  }

  #update(ctx) {
    requestAnimationFrame(() => this.#update(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.#drawBoard(ctx);
    this.#drawPaddles(ctx);
    this.ball.move(this.player1, this.player2);
    if (this.#marked(ctx)) {
      this.ball.resetPosition();
      this.player1.resetPosition();
      this.player2.resetPosition();
    }
  }

  #drawPaddles(ctx) {
    if (this.player1) this.player1.draw();
    if (this.player2) this.player2.draw();
  }

  #drawBoard(ctx) {
    ctx.fillStyle = "#222831";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  #movePaddels(e) {
    if (e.code == "KeyW") {
      if (this.role === "player1") this.player1.movePlayer("up");
      else this.player2.movePlayer("up");
      this.websocket.send(JSON.stringify({ move: "up" }));
    } else if (e.code == "KeyS") {
      if (this.role === "player1") this.player1.movePlayer("down");
      else this.player2.movePlayer("down");
      this.websocket.send(JSON.stringify({ move: "down" }));
    }
  }

  #updatePaddels(data) {
    if (data.sender !== this.game_id) {
      if (data.move === "up") {
        if (this.role === "player1") this.player2.movePlayer("up");
        else this.player1.movePlayer("up");
      } else if (data.move === "down") {
        if (this.role === "player1") this.player2.movePlayer("down");
        else this.player1.movePlayer("down");
      } else if (data.move === "stop") {
        if (this.role === "player1") this.player2.stopPlayer();
        else this.player1.stopPlayer();
      }
    }
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

customElements.define("online-game", OnlineGame);
