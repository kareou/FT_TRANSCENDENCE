import Link from "./link.js";

export default class SideBar extends HTMLElement {
  constructor() {
    super();
    this.active = false;
    this.selected = "";
  }

  connectedCallback() {
    this.initURLChangeDetection();
    this.checkAndRender();
  }

  findSelected() {
    const links = this.querySelectorAll("a");
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (Link.startWith(window.location.pathname, link.getAttribute("href"))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  }

  // Check the current URL and render if it matches certain criteria
  checkAndRender() {
    const path = window.location.pathname;
    if (path === "/signin" || path === "/signup" || path === "/" || path === "/gameplay") {
      return;
    }
    this.render();
    this.findSelected();
  }

  // Initialize URL change detection
  initURLChangeDetection() {
    // Override pushState and replaceState to detect changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    this.selected = window.location.pathname;
    // Listen for popstate, hashchange, and custom locationchange events
    window.addEventListener('popstate', this.checkAndRender.bind(this));
    window.addEventListener('hashchange', this.checkAndRender.bind(this));
    window.addEventListener('locationchange', this.checkAndRender.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);
  }

  disconnectedCallback() {
  }

  render() {
    this.innerHTML = /*HTML*/ `
<div class="sidebar_wrapper">
    <div class="logo_wrapper">
      <img src="/public/assets/gamelogo.png" alt="game logo" class="icon_side_bar">
    </div>
    <div class="dash_logos_wrapper">
      <a is="co-link" href="/dashboard" class="active">
        <i class="fa-thin fa-objects-column fa-2xl icon_side_bar"></i>
      </a>
      <a is="co-link" href="/gameplay">
        <i class="fa-light fa-gamepad-modern fa-2xl icon_side_bar"></i>
      </a>
      <a is="co-link" href="/chat">
        <i class="fa-light fa-message-dots fa-2xl icon_side_bar"></i>
      </a>
      <a is="co-link" href="/settings">
        <i class="fa-light fa-gear fa-2xl icon_side_bar"></i>
      </a>
    </div>
    <div class="logout_logo_wrapper">
      <img src="/public/assets/Logout.png" alt="Logout logo" class="icon_side_bar">
    </div>
</div>
`;
  }
}
customElements.define("side-bar", SideBar);
