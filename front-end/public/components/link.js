import { routes } from "../router/routes.js";
import Http from "../http/http.js";

export default class Link extends HTMLAnchorElement {
  constructor() {
    super();
    // Set up your custom behavior here
  }


  static startWith(string, prefix) {
    return string.slice(0, prefix.length) === prefix;
  }


  static async navigateTo(url) {
    const isAuth = await Http.verifyToken();
    console.log(isAuth);
    if ( isAuth === false && url !== "/signin" && url !== "/signup" && url !== "/") {
      url = "/signin";
    }
    if (isAuth === true && (url === "/signin" || url === "/signup")) {
      url = "/";
    }
    if (url !== window.location.pathname) window.history.pushState({}, "", url);
    let route = null;
    for (let i = 0; i < routes.length; i++) {
      let pos = url.indexOf("/?");
      if (pos === -1) {
        pos = url.length;
      }
      const path = url.slice(0, pos);
      if (routes[i].path === path) {
        route = routes[i];
        break;
      }
    }
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
      const href = this.getAttribute("href");
      window.history.pushState({}, "", href);
      Link.navigateTo(href);
    });
  }
}

customElements.define("co-link", Link, { extends: "a" });
