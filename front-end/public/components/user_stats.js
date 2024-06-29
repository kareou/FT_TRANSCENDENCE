import Http from "../http/http.js";

export default class UserStats extends HTMLElement {
    constructor() {
        super();
        this.user = this.getAttribute("user");
        this.stats = {};
    }
    connectedCallback() {
        this.getStats();
    }
    getStats() {
        Http.getData("GET", `api/stats/${this.user}`).then((data) => {
            this.stats = data;
            this.render();
        });
    }
    calcWinrate(){
        return (this.stats.matche_won / this.stats.matche_played) * 100;
    }
    render() {
        this.innerHTML = /*html*/ `
        <div class="user_stats" style="grid-area: game;">
            <div class="win_rate">
                <div>
                    <span class="stat_label">Win Rate</span>
                    <span class="stat_value">${this.calcWinrate().toFixed(2)}%</span>
                    <span class="stat_subtext">${this.stats.matche_won}W - ${this.stats.matche_lost}L</span>
                </div>
            </div>
            <div class="extra_stats">
                <div class="stat_type">
                    <span class="stat_label">Goals Scored</span>
                    <span class="stat_subtext">${this.stats.goals_scored}</span>
                </div>
                <div class="stat_type">
                    <span class="stat_label">Goals Conceded</span>
                    <span class="stat_subtext">${this.stats.goals_conceded}</span>
                </div>
                <div class="stat_type">
                    <span class="stat_label">Goal Difference</span>
                    <span class="stat_subtext">${this.stats.goals_difference}</span>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("user-stats", UserStats);