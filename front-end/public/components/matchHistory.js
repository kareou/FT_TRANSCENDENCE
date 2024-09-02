import MatchData from "./match_data.js";
import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class MatchHistory extends HTMLElement {
  constructor() {
    super();
    this.user = this.getAttribute("user");
    this.matches = [];
  }
  connectedCallback() {
    Http.getData("GET", `api/matche/history/${this.user}`).then((data) => {
      this.matches = data;
      console.log(this.matches);
      this.render();
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
      <div class="match_history">
        <div class="matches">
          ${
            this.matches.length > 0
              ? this.matches.map(
                  (match) =>
                    `<div class="matchdata ${
                      match.winner.username === this.user ? "win" : "lose"
                    }">
                <div class="player">
                    <img src="${ips.baseUrl}${
                      match.player1.profile_pic
                    }" alt="avatar" loading="lazy" />
                    <h1>${match.player1_score}</h1>
                </div>
                <h1>VS</h1>
                <div class="player">
                    <h1>${match.player2_score}</h1>
                    <img src="${ips.baseUrl}${
                      match.player2.profile_pic
                    }" alt="avatar" loading="lazy" />
                </div>
            </div>
            `
                )
              : `
              <div class="no_matches">
            <i class="fa-sharp fa-thin fa-empty-set fa-2xl" style="color: #ffffff;"></i>
            <h1>WE DIDNT FIND ANY MATCHES FOR THIS PLAYER</h1>
            <a is="co-link" href="/dashboard/game/online" class="game_button" id="online">Play a game</a>
            </div>
            `
          }
        </div>
    `;
  }
}
customElements.define("match-history", MatchHistory);
