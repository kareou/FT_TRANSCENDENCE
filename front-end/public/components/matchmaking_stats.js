import Http from "../http/http.js";

export default class MatchmakingStats extends HTMLElement {

	constructor() {
		super();
		this.user = Http.user;
		this.userStats = {
			matches: "-",
			win: "-",
			lose: "-",
			draw: "-"
		};
	}

	updateStats(stats) {
		this.userStats.matches = stats.matche_played;
		this.userStats.win = stats.matche_won;
		this.userStats.lose = stats.matche_lost;
		this.userStats.draw = stats.matche_draw;
	}

	connectedCallback() {
		this.render();
		Http.getData("GET",`api/stats/${this.user.id}`)
			.then((data) => {
				this.updateStats(data);
				this.render();
			});
	}

	render() {
		this.innerHTML = /*html*/`
		<div class="playerStats">
			<div class="statItem">
				<span>Matches</span>
				<span>
				${this.userStats.matches}
				</span>
			</div>
			<div class="statItem">
				<span>Win</span><span>
				${this.userStats.win}
				</span>
			</div>
			<div class="statItem">
				<span>Lose</span><span>
				${this.userStats.lose}
				</span>
			</div>
			<div class="statItem">
				<span>Draw</span><span>
				${this.userStats.draw}
				</span>
				</div>
        </div>
	  `;
	}
}

customElements.define("matchmaking-stats", MatchmakingStats);
