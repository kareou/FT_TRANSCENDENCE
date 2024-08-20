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
    <profile-info id="${this.user.id}"></profile-info>
    <div class="rank">
      <div class="first">
        <img src="/public/assets/medal.png" alt="medal">
        <h1>iness joumaa</h1>
      </div>
      <div class="second">
        <h1>Friends</h1>
      </div>
      <div class="third">
        <h1>Friends</h1>
      </div>
    </div>
    <div class="game_wrapper">
      <a is="co-link" href="/dashboard/game/local/1v1" class="game_button" id="local">Play Local</a>
      <a is="co-link" href="/dashboard/game/online/1v1" class="game_button" id="online">Play Online</a>
    </div>
    <div class="online_friend">
      <h1>Friends</h1>
    </div>
  </div>
`;
  }
}

customElements.define("dashboard-page", Dashboard);
