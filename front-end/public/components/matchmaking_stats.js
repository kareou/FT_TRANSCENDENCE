import Http from "../http/http.js";

export default class MatchmakingStats extends HTMLElement {

	constructor() {
		super();
		this.id = Number.parseInt(this.getAttribute("id"));
		this.userStats = {
			matches: "-",
			win: "-",
			lose: "-",
			draw: "-"
		};
		this.matched_users = [Http.user,null];
		this.user = null
		Http.website_stats.addObserver({ update: this.update.bind(this), event: "matchmaking", data: ""});
	}

	updateStats(stats) {
		this.userStats.matches = stats.matche_played;
		this.userStats.win = stats.matche_won;
		this.userStats.lose = stats.matche_lost;
		this.userStats.draw = stats.matche_draw;
	}

	connectedCallback() {
		this.getUser();
		this.render();
		if (this.user) {
			Http.getData("GET",`api/stats/${this.user.id}`)
			.then((data) => {
				this.updateStats(data);
				this.render();
			});
		}
	}

	getUser(){
		this.user = this.matched_users[this.id - 1];
	}

	update(data) {
		this.matched_users = data.players;
		this.getUser();
		if (this.user){

			Http.getData("GET",`api/stats/${this.user.id}`)
			.then((data) => {
				this.updateStats(data);
				this.render();
			});
		}
		else{
			this.userStats = {
				matches: "-",
				win: "-",
				lose: "-",
				draw: "-"
			}
		}
		this.render();
	}

	render() {
		this.innerHTML = /*html*/`
		<div class="playerStats">
			<h1 class="statItem">
				<span>Matches</span>
				<span>
				${this.userStats.matches}
				</span>
			</h1>
			<h1 class="statItem">
				<span>Win</span><span>
				${this.userStats.win}
				</span>
			</h1>
			<h1 class="statItem">
				<span>Lose</span><span>
				${this.userStats.lose}
				</span>
			</h1>
			<h1 class="statItem">
				<span>Draw</span><span>
				${this.userStats.draw}
				</span>
				</h1>
        </div>
	  `;
	}
}

customElements.define("matchmaking-stats", MatchmakingStats);
