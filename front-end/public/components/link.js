import { routes } from "../router/routes.js";
import Http from "../http/http.js";

export default class Link extends HTMLAnchorElement {
  constructor() {
    super();
  }

  static startWith(string, prefix) {
    return string.startsWith(prefix);
  }

  static matchUrl(url, path) {
    if (path === '/') return url === path;
    if (url.endsWith('/'))
      url = url.slice(0, -1);
    return url === path;
  }


  static async findRoute(routers, path, parent_path = "") {
    if (!Array.isArray(routers)) {
      return null;
    }
    let route = null;
    const isAuth = await Http.verifyToken();
    for (let i = 0; i < routers.length; i++) {
      if (routers[i].requireAuth === true) {
        if (isAuth === false) {
          return Link.findRoute(routers[i].children, "/auth/signin", "");
        }
        if (routers[i].children) {
          route = await Link.findRoute(routers[i].children, path, parent_path + routers[i].path);
          if (route) return route;
        }
        if (Link.matchUrl(path, parent_path+routers[i].path)) {
          return routers[i];
        }
      }else{
        if (routers[i].children) {
          route = await Link.findRoute(routers[i].children, path, parent_path + routers[i].path);
          if (route) return route;
        }
        if (Link.matchUrl(path, parent_path+routers[i].path)) {
          return routers[i];
        }
      }
    }
    return route;
  }

  static async navigateTo(url) {
    if (url !== window.location.pathname) window.history.pushState({}, "", url);
    let pos = url.indexOf("/?");
    if (pos === -1) {
      pos = url.length;
    }
    const path = url.slice(0, pos);
    var route = await Link.findRoute(routes, path);
    if (!route) route = routes[0];
    const root = document.getElementById("app");
    try {
      const component = await route.component();
      const componentToRender = new component.default();
      if (root.firstChild) {
        root.removeChild(root.firstChild);
      }
      root.appendChild(componentToRender);
      const event = new CustomEvent("locationchange", {detail: path});
      window.dispatchEvent(event);

    } catch (e) {
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
