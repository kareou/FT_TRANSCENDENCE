import { ClassicPaddle, BlossomPaddle, LightSaber } from "./game_objects/player.js";
import { Ball } from "./game_objects/ball.js";
import { Board } from "./game_objects/board.js";
import Http from "../../http/http.js";
import Link from "../../components/link.js";
import {ips} from "../../http/ip.js";

const getPlayerObject = (paddle_name, player_num, ctx, theme) => {
  if (paddle_name === "classic")
    return new ClassicPaddle(player_num, ctx, theme);
  else if (paddle_name === "blossom")
    return new BlossomPaddle(player_num, ctx, theme);
  else if (paddle_name === "lightsaber")
    return new LightSaber(player_num, ctx, theme);
}


export default class OnlineGame extends HTMLElement {
  constructor() {
    super();
    this.player1 = null;
    this.player2 = null;
    this.ball;
    this.win = false;
    this.winner = null;
    this.websocket = null;
    this.game_ended = false;
    this.board;
    this.role = null;
    this.game_started = false;
    this.keyStates = {};
    this.game_progress = "playing";
  }

  updateGameStats(newstate) {
    this.player1.x = newstate.p1.x * this.player1.ctx.canvas.width;
    this.player1.y = newstate.p1.y * this.player1.ctx.canvas.height;
    this.player2.x = newstate.p2.x * this.player2.ctx.canvas.width;
    this.player2.y = newstate.p2.y * this.player2.ctx.canvas.height;
    this.ball.x = newstate.ball.x * this.ball.ctx.canvas.width;
    this.ball.y = newstate.ball.y * this.ball.ctx.canvas.height;
    this.player1.score = newstate.p1score;
    this.player2.score = newstate.p2score;
    this.game_progress = newstate.game_progress;
    document.getElementById("p1_score").innerText = this.player1.score;
    document.getElementById("p2_score").innerText = this.player2.score;

    if (this.game_progress === "pause") {
      document.removeEventListener("keydown", (e) => this.#handleKeyDown(e));
      this.roundStartCountDown(this.ball.ctx);
      document.addEventListener("keydown", (e) => this.#handleKeyDown(e));
    }
    else if (this.game_progress === "end") {
      if (this.player1.score > this.player2.score) {
        this.winner = "player1";
      } else {
        this.winner = "player2";
      }
      this.declareWinner();
    }
  }

  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameid = urlParams.get("game_id");
    console.log(gameid);
    if (!gameid) {
      Link.navigateTo("/dashboard");
      Http.website_stats.notify("toast", { type: "warning", message: "Game ID not found" });
      return
    }
    else{
      this.websocket = new WebSocket(
        `${ips.socketUrl}/ws/gamematch/${gameid}/`
      );
      this.render();
      const canvas = this.querySelector(".board");
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = canvas.getContext("2d");
      this.player1 = getPlayerObject(Http.user.paddle_type, 0, ctx, this.theme);
      this.player2 = getPlayerObject(Http.user.paddle_type, 1, ctx, this.theme);
      this.ball = new Ball(ctx, Http.user.table_theme);
      this.board = new Board(ctx, Http.user.table_theme);
      this.websocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.winner) {
          console.log(data.winner)
          this.winner = data.winner;
        }
        if (data.role) {
          this.role = data.role;
          Http.website_stats.notify("gameusers", { [this.role]: Http.user });
        }
        if (data.state){
          this.updateGameStats(data.state);
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
      this.websocket.onerror = (e) => {
        Link.navigateTo("/dashboard");
        Http.website_stats.notify("toast", { type: "error", message: "This game is already over or does not exist" });
      }
    }
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
    let win = this.role === this.winner ? "won" : "lost";
    modal.setAttribute("type", win);
    this.appendChild(modal);
    this.websocket.close(3000);
    this.websocket = null;
  }

  roundStartCountDown(ctx) {
      let count_down = 3;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.board.draw();
      this.#drawPaddles(ctx);
      this.ball.draw();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "100px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(count_down, ctx.canvas.width / 2, ctx.canvas.height / 2);
      count_down -= 1;
      const intervalId = setInterval(() => {
        if (count_down === -1) {
          clearInterval(intervalId);
          this.game_progress = "waiting";
          return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.board.draw();
        this.#drawPaddles(ctx);
        this.ball.draw();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "100px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(count_down, ctx.canvas.width / 2, ctx.canvas.height / 2);
        count_down -= 1;
      }, 1000);
  }

  async #update(ctx) {
    var id = requestAnimationFrame(() => this.#update(ctx));
    if (this.game_progress === "end") {
      cancelAnimationFrame(id);
      return;
    }
    else if (this.game_progress === "pause") {

    }else if (this.game_progress === "playing") {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.#drawBoard(ctx);
      this.#drawPaddles(ctx);
      this.ball.draw();
      this.#updatePlayerPositions();
    }
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
    this.board.draw();
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
      this.websocket.send(JSON.stringify({ direction: "up", sender: this.role }));
    }
    if (this.keyStates["KeyS"]) {
      this.websocket.send(JSON.stringify({ direction: "down", sender: this.role }));
    }
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
