import { routes } from "../router/routes.js";
import Http from "../http/http.js";

export default class Link extends HTMLAnchorElement {
  constructor() {
    super();
    // Set up your custom behavior here
  }

  static verifyAuth() {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token === undefined) {
      return false;
    }

    fetch(`${Http.baseUrl}/api/token/verify/`, {
      method: "POST", // Usually, token verification is done with a POST request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }) // Adjust according to your API spec
    })
      .then((res) => {
        if (res.status === 200) {
          return true;
        } else if (res.status === 401) {
            Http.refreshToken().then((res) => {
              if (res.token) {
                return true;
              } else {
                return false;
              }
            })
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.error('Error verifying token:', error);
        window.location.href = "/signin";
        return false;
      });
  }


  static async navigateTo(url) {
    const isAuth = Link.verifyAuth();
    if ( isAuth === false && url !== "/signin" && url !== "/signup" && url !== "/") {
      url = "/signin";
    }
    if (isAuth === true && (url === "/signin" || url === "/signup")) {
      url = "/";
    }
    if (url !== window.location.pathname) window.history.pushState({}, "", url);
    // window.dispatchEvent(new PopStateEvent('popstate'));
    // var newurl = url.split('?')[0];
    let route = null;
    for (let i = 0; i < routes.length; i++) {
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
