import Http from "../http/http.js";

export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    document.title = "dashboard";
    this.user = Http.user;
  }

  connectedCallback() {



    this.render();

  }
  render() {
    this.innerHTML = /*HTML*/ `

    <div class="dashboard_wrapper">
      <profile-info user="${this.user.username}"></profile-info>
      <friend-pends></friend-pends>
      <div class="game_wrapper">
        <a is="co-link" href="/dashboard/game/local/1v1" class="game_button" id="local">Play Local</a>
        <a is="co-link" href="/dashboard/game/online/1v1" class="game_button" id="online"><i class="fa-solid fa-globe"></i><span class="text">Play Online</span></a>
      </div>
      <c-friends></c-friends>
    </div>
    `;
    }
    }

    customElements.define("dashboard-page", Dashboard);
