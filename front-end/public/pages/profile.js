import Http from "../http/http.js";

export default class Profile extends HTMLElement {
  constructor() {
    super();
    document.title = "profile";
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
    <user-stats user="${this.user.id}"></user-stats>
    <match-history id="${this.user.id}"></match-history>
  </div>
`;
  }
}

customElements.define("profile-page", Profile);
