import Http from "../http/http.js";

export default class MatchMakingAvatar extends HTMLElement {

  constructor() {
	  super();
    this.user = Http.user;
    console.log(this.user);
  }

  connectedCallback() {
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
