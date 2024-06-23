import Link from "./link.js";

export default class TopBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initURLChangeDetection();
    this.checkAndRender();
  }

  checkAndRender() {
    const path = window.location.pathname;
    if (path === "/" || Link.startWith(path, "/game") || Link.startWith(path, "/auth")) {
      return;
    }
    this.render();
  }

  initURLChangeDetection() {
    this.selected = window.location.pathname;
    // Listen for popstate, hashchange, and custom locationchange events
    window.addEventListener("locationchange", this.checkAndRender.bind(this));
  }

  render() {
    this.innerHTML = /*HTML*/ `
        <div class="chat_notification_bar_wrapper">
                <div class="search_input_wrapper">
                    <input type="text" name="search" id="search_chat" class="search_chat"
                        placeholder="Search Everything">
                </div>
                <div class="notification_wrapper">
                    <img src="/public/assets/notification.png" alt="notification logo" class="notification_icon">
                </div>
            </div>
        `;
  }
}

customElements.define("top-bar", TopBar);
