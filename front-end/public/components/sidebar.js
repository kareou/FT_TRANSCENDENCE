export default class SideBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (window.location.pathname === "/signin" || window.location.pathname === "/signup" || window.location.pathname === "/" || window.location.pathname === "/gameplay")
      return;
    this.render();
  }

  disconnectedCallback() {
    console.log("disconnected");
  }

  render() {
    this.innerHTML = /*HTML*/ `
<div class="sidebar_wrapper">
  <div class="logo_wrapper">
    <img src="/public/assets/gamelogo.png" alt="game logo" class="icon_side_bar">

  </div>
  <div class="dash_logos_wrapper">
    <a is="co-link" href="/dashboard">
      <i class="fa-thin fa-objects-column fa-2xl icon_side_bar" style="color: #ffffff;"></i>
    </a>
    <i class="fa-light fa-gamepad-modern fa-2xl icon_side_bar" style="color: #ffffff;"></i>
    <i class="fa-light fa-message-dots fa-2xl icon_side_bar" style="color: #04D98B;"></i>
    <i class="fa-light fa-gear fa-2xl icon_side_bar" style="color: #ffffff;"></i>
  </div>
  <div class="logout_logo_wrapper">
    <img src="/public/assets/Logout.png" alt="Logout logo" class="icon_side_bar">
  </div>
</div>
`;
  }
}
customElements.define("side-bar", SideBar);
