import Http from "../http/http.js";
import MatchMaking from "../pages/matchmaking.js";

export default class MatchMakingAvatar extends HTMLElement {

  constructor() {
	  super();
		this.id = Number.parseInt(this.getAttribute("id"));;
    this.matched_users = [Http.user,null];
    Http.website_stats.addObserver({ update: this.update.bind(this), event: "matchmaking", data: ""});
    this.user = null;
    this.profile_pic = "https://api.dicebear.com/9.x/bottts-neutral/svg";
  }

  getUser(){
		this.user = this.matched_users[this.id - 1];
	}

	update(data) {
		this.matched_users = data.players;
		this.getUser();
		this.render();
	}

  generateRandomAvatars() {
    setInterval(() => {
      this.profile_pic = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.floor(Math.random() * 10)}`;
      this.render();
      if (this.user) {
        clearInterval();
      }
    }, 500);
  }


  connectedCallback() {
    this.getUser();
		this.render();
	}

  render() {
    this.innerHTML =  /*html*/`
      <div class="avatar">
        ${this.user ? `<img src="http://localhost:8000${this.user.profile_pic}" alt="avatar" loading="lazy"/>
        <h1 id="opponents_name">${this.user.username}</h1>
        ` : 
         `<img src="${this.profile_pic}" alt="avatar" id="loading_img" loading="lazy"/>
         <h1 class="search_player">
         searching for opponent <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
         </h1>
         `}

      </div>
      `;
    }

    
  }
customElements.define("matchmaking-avatar", MatchMakingAvatar);
