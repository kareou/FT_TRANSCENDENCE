import Http from "../http/http.js";

export default class Profile extends HTMLElement {
  constructor() {
    super();
    document.title = "profile";
    this.user = this.getAttribute("user") || Http.user.username;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
  <div class="dashboard_wrapper">
    <profile-info user="${this.user}"></profile-info>
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
    <user-stats user="${this.user}"></user-stats>
    <match-history user="${this.user}"></match-history>
  </div>
`;
  }
}

customElements.define("profile-page", Profile);
