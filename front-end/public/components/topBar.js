import Link from "./link.js";

export default class TopBar extends HTMLElement {
  constructor() {
    super();
    this.welcome = false;
    this.boundCheckAndRender = this.checkAndRender.bind(this);
  }

  connectedCallback() {
    this.checkAndRender();
  }

  checkAndRender() {
    const path = window.location.pathname;
    if (path === "/" || path.startsWith("/auth"))
      return;
    if (path === "/dashboard")
      this.welcome = true;
    else
      this.welcome = false;
    this.initURLChangeDetection();
    this.render();
  }

  initURLChangeDetection() {
    // Listen for popstate, hashchange, and custom locationchange events
    window.removeEventListener("locationchange", this.boundCheckAndRender);
    window.addEventListener("locationchange", this.boundCheckAndRender);
  }

  render() {
    this.innerHTML = /*HTML*/ `
        <div class="chat_notification_bar_wrapper">
        ${this.welcome ? "<h1 id='welcoming'>Welcom back,</h1>" : "<h1 id='welcoming'></h1>"}
        <div>
                <div class="search_input_wrapper">
                    <input type="text" name="search" id="search_chat" class="search_chat"
                        placeholder="Search Everything">
                </div>
                <notification-icon></notification-icon>
            </div>
            </div>
        `;
  }
}

customElements.define("top-bar", TopBar);
