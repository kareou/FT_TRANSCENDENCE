import Http from "../http/http.js";
import Observer from "../state/observer.js";
import Link from "../components/link.js";

export default class MatchMaking extends HTMLElement {
  constructor() {
    super();
    this.websocket = null;
    this.user = Http.user;
    this.intervalId = null;
    this.matchmakingstate = {
      players: [this.user],
      ready: false,
    };
    Http.website_stats.addObserver({
      update: () => this.render(),
      envent: "matchmaking",
      data: this.matchmakingstate,
    });
  }

  static get state() {
    return this.matchmakingstate;
  }

  get getState() {
    return this.matchmakingstate;
  }

  connectedCallback() {
    this.websocket = new WebSocket("ws://localhost:8000/ws/matchmaking/");
    this.websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.player2) {
        if (this.matchmakingstate.players.length === 2){
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          this.matchmakingstate.players.pop();
          Http.website_stats.notify("matchmaking", this.matchmakingstate);
          this.reset();
          return;
        }
        this.matchmakingstate.players.push(data.player2);
        Http.website_stats.notify("matchmaking", this.matchmakingstate);
        const cancel = this.querySelector("#cancel");
        const game_id = data.game_id;
        const state = this.querySelector("#lobby_state");
        if (this.matchmakingstate.players.length === 2) {
          cancel.setAttribute("disabled", true);
          var counter = 3;
          state.innerHTML = `Game starting in ${counter}...`;
          this.intervalId = setInterval(() => {
            counter--;
            state.innerHTML = `Game starting in ${counter}...`;
            if (counter === 0) {
              clearInterval(this.intervalId);
              this.intervalId = null;
              this.websocket.close(3000);
              this.websocket = null;
              Link.navigateTo(`/game/online/?game_id=${game_id}`);
            }
          }, 1000);
        }
      }
    };
    this.render();
    const cancel = this.querySelector("#cancel");
    cancel.addEventListener("click", () => {
      this.websocket.close();
      Link.navigateTo("/dashboard");
    });
  }

  reset(){
    const cancel = this.querySelector("#cancel");
    cancel.removeAttribute("disabled");
    const state = this.querySelector("#lobby_state");
    state.innerHTML = "Waiting for a player to join...";
  }

  disconnectedCallback() {
    if (this.websocket)
      this.websocket.close(3001);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  render() {

    this.innerHTML = /*html*/ `
		<div class="matchmaking-wrapper">
      <div class="matchmaking">
        <div className="mm_player1">
          <matchmaking-avatar id="1"></matchmaking-avatar>
          <matchmaking-stats id="1"></matchmaking-stats>
        </div>
        <img src="/public/assets/VS.png" alt="vs" id="vspng" loading="lazy" />
        <div className="mm_player2">
          <matchmaking-avatar id="2"></matchmaking-avatar>
          <matchmaking-stats id="2"></matchmaking-stats>
        </div>
      </div>
      <div class="actions">
        <h1 id="lobby_state">Waiting for a player to join...</h1>
        <button id="cancel">cancel</button>
      </div>
		</div>
	`;
  }
}

customElements.define("match-making", MatchMaking);
