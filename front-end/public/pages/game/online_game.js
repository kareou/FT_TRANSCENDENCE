import { ClassicPaddle } from "./game_objects/player.js";
import { Ball } from "./game_objects/ball.js";

export default class OnlineGame extends HTMLElement {
  constructor() {
    super();
    this.player1 = null;
    this.player2 = null;
    this.ball;
    this.websocket = null;
    this.role = null;
    this.game_started = false;
  }

  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameid = urlParams.get("game_id");
    this.websocket = new WebSocket(
      `ws://localhost:8000/ws/gamematch/${gameid}/`
    );
    this.render();
    const canvas = this.querySelector(".board");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    this.player1 = new ClassicPaddle(0, ctx, "mod");
    this.player2 = new ClassicPaddle(1, ctx, "mod");
    this.ball = new Ball(ctx, "sky");
    this.websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.role) {
        this.role = data.role;
        console.log(this.role);
      }
      if (data.data) {
        if (data.data.sender !== this.role) {
          if (data.data.sender === "player1") {
            this.player1.y = data.data.py;
          } else {
            this.player2.y = data.data.py;
          }
        }
      }
      if (data.ball) {
        if (this.role === "player2"){
          this.ball.x = data.ball.x;
          this.ball.y = data.ball.y;
          this.ball.dx = data.ball.dx;
          this.ball.dy = data.ball.dy;
        }
      }
      if (data.message) {
        if (data.message === "Game is starting") {
          this.game_started = true;
          this.#timeCountUp();
          this.#update(ctx);
        }
      }
    };
    this.#drawBoard(ctx);
    this.#drawPaddles(ctx);
    this.ball.draw();
    document.addEventListener("keydown", this.#movePaddels.bind(this));
    document.addEventListener("keyup", (e) => {
      if (e.code == "KeyW" || e.code == "KeyS") {
        if (this.role === "player1"){
          this.player1.stopPlayer();
          this.websocket.send(JSON.stringify({data: {py: this.player1.y, sender: this.role}}));
        }else{
          this.player2.stopPlayer();
          this.websocket.send(JSON.stringify({data: {py: this.player2.y, sender: this.role}}));
        }
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#movePaddels);
    document.removeEventListener("keyup", (e) => {
      if (e.code == "KeyW" || e.code == "KeyS") {
        if (this.role === "player1") this.player1.stopPlayer();
        else this.player2.stopPlayer();
      }
    });
    this.websocket.close();
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
        <h1 class="timer">
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
    this.#drawBoard(ctx);
    this.#drawPaddles(ctx);
    // this.ball.move(this.player1, this.player2);
    if (this.#marked(ctx)) {
      this.ball.resetPosition();
      this.player1.resetPosition();
      this.player2.resetPosition();
    }
    if (this.role === "player1")
      this.sendBallState()
    this.ball.draw();
  }

  sendBallState() {
    const ball = {
      x: this.ball.x,
      y: this.ball.y,
      dx: this.ball.dx,
      dy: this.ball.dy
    }
    this.websocket.send(JSON.stringify({ball: ball}));
  }

  #drawPaddles(ctx) {
    this.player1.draw();
    this.player2.draw();
  }

  #drawBoard(ctx) {
    ctx.fillStyle = "#222831";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  #movePaddels(e) {
    if (e.code == "KeyW") {
      if (this.role === "player1"){
        this.player1.movePlayer("up");
        this.websocket.send(JSON.stringify({data: {py: this.player1.y, sender: this.role}}));
      }
      else{ 
        this.player2.movePlayer("up")
        this.websocket.send(JSON.stringify({data: {py: this.player2.y, sender: this.role}}));
      }
    } else if (e.code == "KeyS") {
      if (this.role === "player1"){
        this.player1.movePlayer("down");
        this.websocket.send(JSON.stringify({data: {py: this.player1.y, sender: this.role}}));
      }
      else{
        this.player2.movePlayer("down")
        this.websocket.send(JSON.stringify({data: {py: this.player2.y, sender: this.role}}));
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
