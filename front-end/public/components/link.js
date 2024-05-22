import { routes } from "../router/routes.js";

export default class Link extends HTMLAnchorElement {
  constructor() {
    super();
    // Set up your custom behavior here
  }

  static async navigateTo(url) {
    console.log("navigating to ", url);
    if (url !== window.location.pathname) window.history.pushState({}, "", url);
    // window.dispatchEvent(new PopStateEvent('popstate'));
    // var newurl = url.split('?')[0];
    let route = null;
    for (let i = 0; i < routes.length; i++) {
      console.log("looping");
      let pos = url.indexOf("/?");
      if (pos === -1) {
        pos = url.length;
      }
      const path = url.slice(0, pos);
      console.log(path);
      if (routes[i].path === path) {
        route = routes[i];
        break;
      }
    }
    console.log("here the routes ", route);
    if (!route) route = routes[0];
    const root = document.getElementById("app");
    try {
      const component = await route.component();
      const componentToRender = new component.default();
      root.innerHTML = "";
      root.appendChild(componentToRender);
    } catch (e) {
      console.error(e);
    }
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("clicked");
      const href = this.getAttribute("href");
      // const text = this.getAttribute('text') || this.innerHTML;
      // this.innerHTML = text;
      window.history.pushState({}, "", href);
      Link.navigateTo(href);
      // window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
}

customElements.define("co-link", Link, { extends: "a" });
