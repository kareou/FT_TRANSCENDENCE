import MatchData from "./match_data.js";
import Http from "../http/http.js";

export default class MatchHistory extends HTMLElement {
  constructor() {
    super();
    this.id = this.getAttribute("id");
    this.matches = [];
  }
  connectedCallback() {
    Http.getData("GET",`api/matche/history/${this.id}`).then((data) => {
      this.matches = data;
      console.log(this.matches);
      this.render();
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
      <div class="match_history">
        <h1>Last 5 matches</h1>
        <div class="matches">
          ${this.matches.map(
            (match) =>
              `<match-data user="${this.id}" p1="${match.player1}" p2="${match.player2}" p1score="${match.player1_score}" p2score="${match.player2_score}" winner="${match.winner}"></match-data>`
          )}
      </div>
    `;
    }
}
customElements.define("match-history", MatchHistory);