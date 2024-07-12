import { ClassicPaddle } from "./game_objects/player.js";
import { Ball } from "./game_objects/ball.js";
import Http from "../../http/http.js";

export default class OnlineGame extends HTMLElement {
  constructor() {
    super();
    this.player1 = null;
    this.player2 = null;
    this.ball;
    this.winner = null;
    this.websocket = null;
    this.game_ended = false;
    this.role = null;
    this.game_started = false;
    this.keyStates = {};
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
        Http.website_stats.notify("gameusers", { [this.role]: Http.user });
      }
      if (data.state) {
        if (data.state.sender !== this.role) {
          if (this.role === "player1") {
            this.player2.y = data.state.py;
          } else {
            this.player1.y = data.state.py;
          }
        }
      }
      if (data.winner) {
        if (data.winner.id === Http.user.id) this.winner = "You";
        else this.winner = data.winner.username;
        this.game_ended = true;
      }
      if (data.ball) {
        if (this.role === "player2") {
          this.ball.x = data.ball.x;
          this.ball.y = data.ball.y;
          this.ball.dx = data.ball.dx;
          this.ball.dy = data.ball.dy;
        }
      }
      if (data.score) {
        if (this.role === "player2") {
          this.player1.score += data.score.p1;
          this.player2.score += data.score.p2;
          document.getElementById("p1_score").innerText =
            this.player1.score.toString();
          document.getElementById("p2_score").innerText =
            this.player2.score.toString();
        }
      }
      if (data.message) {
        if (data.users) Http.website_stats.notify("gameusers", data.users);
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
    document.addEventListener("keydown", (e) => this.#handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.#handleKeyUp(e));
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", (e) => this.#handleKeyDown(e));
    document.removeEventListener("keyup", (e) => this.#handleKeyUp(e));
    if (this.websocket)
      this.websocket.close(3001);
  }

  render() {
    this.innerHTML = /*html*/ `
<div class="game_container">
  <div class="game">
    <game-score></game-score>
    <canvas class="board"></canvas>
  </div>
</div>
`;
  }

  declareWinner() {
    const modal = document.createElement("winner-modal");
    modal.setAttribute("winner", this.winner);
    this.appendChild(modal);
    this.websocket.close(3000);
    this.websocket = null;
  }

  #update(ctx) {
    var id = requestAnimationFrame(() => this.#update(ctx));
    if (this.game_ended) {
      cancelAnimationFrame(id);
      this.declareWinner();
      return;
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.#drawBoard(ctx);
    this.#drawPaddles(ctx);
    if (this.role === "player1") {
      this.ball.move(this.player1, this.player2);
      if (this.#marked(ctx)) {
        this.ball.resetPosition();
        this.player1.resetPosition();
        this.player2.resetPosition();
      }
      this.sendBallState();
    }
    this.ball.draw();
    this.#updatePlayerPositions();
  }

  sendBallState() {
    const ball = {
      x: this.ball.x,
      y: this.ball.y,
      dx: this.ball.dx,
      dy: this.ball.dy,
    };
    this.websocket.send(JSON.stringify({ ball: ball }));
  }

  #drawPaddles(ctx) {
    this.player1.draw();
    this.player2.draw();
  }

  #drawBoard(ctx) {
    ctx.fillStyle = "#222831";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  #handleKeyDown(e) {
    this.keyStates[e.code] = true;
  }

  #handleKeyUp(e) {
    this.keyStates[e.code] = false;
    if (e.code === "KeyW" || e.code === "KeyS") {
      if (this.role === "player1") {
        this.player1.stopPlayer();
      } else {
        this.player2.stopPlayer();
      }
    }
  }

  #updatePlayerPositions() {
    if (this.keyStates["KeyW"]) {
      if (this.role === "player1") {
        this.player1.movePlayer("up");
        this.websocket.send(
          JSON.stringify({ state: { py: this.player1.y, sender: this.role } })
        );
      } else {
        this.player2.movePlayer("up");
        this.websocket.send(
          JSON.stringify({ state: { py: this.player2.y, sender: this.role } })
        );
      }
    }
    if (this.keyStates["KeyS"]) {
      if (this.role === "player1") {
        this.player1.movePlayer("down");
        this.websocket.send(
          JSON.stringify({ state: { py: this.player1.y, sender: this.role } })
        );
      } else {
        this.player2.movePlayer("down");
        this.websocket.send(
          JSON.stringify({ state: { py: this.player2.y, sender: this.role } })
        );
      }
    }
  }

  #marked(ctx) {
    if (this.ball.x - this.ball.size < 0) {
      this.player2.score++;
      document.getElementById("p2_score").innerText =
        this.player2.score.toString();
      this.websocket.send(JSON.stringify({ score: { p2: 1, p1: 0 } }));
      return true;
    } else if (this.ball.x + this.ball.size > ctx.canvas.width) {
      this.player1.score++;
      this.websocket.send(JSON.stringify({ score: { p2: 0, p1: 1 } }));
      document.getElementById("p1_score").innerText =
        this.player1.score.toString();
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
