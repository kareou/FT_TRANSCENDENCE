import { routes } from "../router/routes.js";
import Http from "../http/http.js";

const root = document.getElementById("app");


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


  static findRoute(routers, path, parent_path = "", isAuth ) {
    let route = null;
    for (let i = 0; i < routers.length; i++) {
      if (routers[i].requireAuth === true) {
        if (isAuth === false) {
          throw new Error("Unauthorized");
        }
        if (routers[i].children) {
          route = Link.findRoute(routers[i].children, path, parent_path + routers[i].path, isAuth);
          if (route) return route;
        }
        if (Link.matchUrl(path, parent_path+routers[i].path)) {
          return routers[i];
        }
      }else{
        if (routers[i].children) {
          route = Link.findRoute(routers[i].children, path, parent_path + routers[i].path, isAuth);
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
    const isAuth = await Http.verifyToken();
    try{
      var route =  Link.findRoute(routes, path, "", isAuth);
      if (!route) throw new Error("Not Found");
    }
    catch (e) {
      if (e.message === "Unauthorized") {
        window.location.href = "/auth/login";
        return;
      }
      window.location.href = "/404";
    }
    if (!route) route = routes[0];
    try {
      const component = await route.component();
      const componentToRender = new component.default();
      root.innerHTML = '';
      root.appendChild(componentToRender);
      const event = new CustomEvent("locationchange", {detail: path});
      if (window && typeof window.dispatchEvent === 'function' && event instanceof Event) {
        window.dispatchEvent(event);
      } else {
          console.error('Cannot dispatch event: ', event);
      }

    } catch (e) {
    }
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
  }

  connectedCallback() {
    this.addEventListener("click", this.handleClick);
  }

  handleClick(e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    window.history.pushState({}, "", href);
    Link.navigateTo(href);
  }
}

customElements.define("co-link", Link, { extends: "a" });
