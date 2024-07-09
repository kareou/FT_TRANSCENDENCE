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
            this.clacWidth();
        });
    }

    calcWinrate() {
        return (this.stats.matche_won / this.stats.matche_played) * 100;
    }

    clacWidth() {
        const setps = document.querySelector(".steps");
        const setpsWidth = setps.offsetWidth;
        const progress = document.querySelectorAll("#progress");
        progress.forEach((element) => {
            const stat = element.getAttribute("for");
            const value = this.stats[stat];
            var width = (value * setpsWidth) / 40;
            if (width > setpsWidth) width = setpsWidth;
            element.style.width = `${width}px`;
        });
    }

    render() {
        this.innerHTML = /*html*/ `
<div class="user_stats">
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
    <figure class="graph">
        <ol>
            <li><span id="stat">
                    matches winned
                </span>
                <span id="progress" for="matche_won"></span>
            </li>
            <li><span id="stat">
                    matches lost
                </span>
                <span id="progress" for="matche_lost"></span>
            </li>
            <li><span id="stat">
                    goals scored
                </span>
                <span id="progress" for="goals_scored"></span>
            </li>
            <li><span id="stat">
                    goals conceded
                </span>
                <span id="progress" for="goals_conceded"></span>
            </li>
        </ol>
        <div class="steps">
            <div class="step">0</div>
            <div class="step">10</div>
            <div class="step">20</div>
            <div class="step">30</div>
            <div class="step">40</div>
        </div>
    </figure>
</div>
`;
    }
}

customElements.define("user-stats", UserStats);
