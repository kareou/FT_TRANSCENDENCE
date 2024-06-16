import Http from "../http/http.js";
import MatchMaking from "../pages/matchmaking.js";

export default class MatchMakingAvatar extends HTMLElement {

  constructor() {
	  super();
		this.id = Number.parseInt(this.getAttribute("id"));;
    this.matched_users = [Http.user,null];
    Http.website_stats.addObserver({ update: this.update.bind(this), event: "matchmaking", data: ""});
    this.user = null;
  }

  getUser(){
		this.user = this.matched_users[this.id - 1];
		if (!this.user)
			this.user = this.matched_users[0];
	}

	update(data) {
		this.matched_users = data.players;
		this.getUser();
		this.render();
	}


  connectedCallback() {
    this.getUser();
		this.render();
	}

  render() {
    this.innerHTML =  /*html*/`
      <div class="avatar">
        <img src="http://localhost:8000${this.user.profile_pic}" alt="avatar" />
      </div>
    `;
  }
}

customElements.define("matchmaking-avatar", MatchMakingAvatar);
