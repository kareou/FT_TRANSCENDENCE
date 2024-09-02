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
  <div class="dashboard_wrapper __flex_dash">
  <div class="first_wrapper_dashboard">
    <profile-info user="${this.user}"></profile-info>
    </div>
    <div class="second_wrapper_dashboard">
      <user-stats class="user_stats" user="${this.user}"></user-stats>
      <match-history class="match_history" user="${this.user}"></match-history>
    </div>
  </div>
`;
  }
}

customElements.define("profile-page", Profile);
