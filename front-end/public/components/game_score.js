import Http from "../http/http.js";

export default class GameScore extends HTMLElement {
  constructor() {
    super();
    this.players = {
        "player1" : null,
        "player2" : null
    };
    Http.website_stats.addObserver({ update: this.update.bind(this), event: "gameusers"});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*html*/ `
        <div class="players">
            <div class="p_info">
                ${this.players.player1 ? `<img id="player_img" src="http://localhost:8000${this.players.player1.profile_pic}" alt="avatar" />
                    <h1>${this.players.player1.username}</h1> 
                    `:
                `<h1>waitin for opponent</h1>
                <img id="player_img" src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                `}
                <h1 id="p1_score">0</h1>
            </div>
            <div class="slash">
                <h1 class="timer">
                <label id="minutes">00</label>:<label id="seconds">00</label>
                </h1>
            </div>
            <div class="p_info">
                <h1 id="p2_score">0</h1>
                ${this.players.player2 ? `<h1>${this.players.player2.username}</h1>
                <img id="player_img" src="http://localhost:8000${this.players.player2.profile_pic}" alt="avatar" />` :
                `<h1>waitin for opponent</h1>
                <img id="player_img" src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                `}
            </div>
        </div>
    `;
  }
  update(data) {
    if (data.player1) {
      this.players.player1 = data.player1;
    }
    if (data.player2) {
      this.players.player2 = data.player2;
    }
    this.render();
  }
}

customElements.define("game-score", GameScore);
