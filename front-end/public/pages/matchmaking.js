import Http from "../http/http.js";
import Observer from "../state/observer.js";

export default class MatchMaking extends HTMLElement {
  constructor() {
    super();
    this.user = Http.user;
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
    const websocket = new WebSocket("ws://localhost:8000/ws/matchmaking/");
    websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.player2) {
        this.matchmakingstate.players.push(data.player2);
        Http.website_stats.notify("matchmaking", this.matchmakingstate);
      }
    };
    this.render();
  }
  render() {
    this.innerHTML = /*html*/ `
		<div class="matchmaking-wrapper">
      <div class="matchmaking">
        <div className="mm_player1">
          <matchmaking-avatar id="1"></matchmaking-avatar>
          <matchmaking-stats id="1"></matchmaking-stats>
        </div>
        <img src="/public/assets/VS.png" alt="" id="vspng"/>
        <div className="mm_player2">
          <matchmaking-avatar id="2"></matchmaking-avatar>
          <matchmaking-stats id="2"></matchmaking-stats>
        </div>
      </div>
      <button id="cancel">cancel</button>
		</div>
	`;
  }
}

customElements.define("match-making", MatchMaking);
