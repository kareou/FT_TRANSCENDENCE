export default class SideBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <div class="sidebar_wrapper">
    <div class="logo_wrapper">
        <img src="assets/gamelogo.png" alt="game logo" class="icon_side_bar">
    </div>
    <div class="dash_logos_wrapper">
        <img src="assets/Dashboard.png" alt="Dashboard logo" class="icon_side_bar">
        <img src="assets/game.png" alt="game logo" class="icon_side_bar">
        <img src="assets/chat_logo.png" alt="Chat logo" class="icon_side_bar">
        <img src="assets/settings.png" alt="Settings logo" class="icon_side_bar">
    </div>
    <div class="logout_logo_wrapper">
        <img src="assets/Logout.png" alt="Logout logo" class="icon_side_bar">
    </div>
</div>
        `;
  }
}
customElements.define("side-bar", SideBar);
