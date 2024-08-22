import MatchData from "./match_data.js";
import Http from "../http/http.js";

export default class MatchHistory extends HTMLElement {
  constructor() {
    super();
    this.user = this.getAttribute("user");
    this.matches = [];
  }
  connectedCallback() {
    Http.getData("GET",`api/matche/history/${this.user}`).then((data) => {
      this.matches = data;
      console.log(this.matches);
      this.render();
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
      <div class="match_history">
        <div class="matches">
          ${this.matches.length > 0 ? 
            this.matches.map(
              (match) =>
                `<match-data user="${this.user}" p1="${match.player1}" p2="${match.player2}" p1score="${match.player1_score}" p2score="${match.player2_score}" winner="${match.winner}"></match-data>`
            )
            :
            `
            <i class="fa-sharp fa-thin fa-empty-set fa-2xl" style="color: #ffffff;"></i>
            <h1>WE DIDNT FIND ANY MATCHES FOR THIS PLAYER</h1>
            <a is="co-link" href=""/dashboard/game/online/1v1" class="game_button" id="online">Play a game</a>
            `
          }
        </div>
    `;
    }
}
customElements.define("match-history", MatchHistory);
