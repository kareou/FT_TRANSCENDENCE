import {routes} from "../router/routes.js"

export default class Link extends HTMLAnchorElement {
    constructor() {
        super();
        // Set up your custom behavior here
    }

    static async navigateTo(url) {
        console.log("navigating to ", url);
        if (url !== window.location.pathname)
            window.history.pushState({}, '', url);
        // window.dispatchEvent(new PopStateEvent('popstate'));
        const route = routes.find(r => r.path === url);
        if (!route)
            route = routes[0];
        const root = document.getElementById('app');
        try{

            const component = await route.component();
            const componentToRender = new component.default();
            root.innerHTML = "";
            root.appendChild(componentToRender);
        }catch(e){
            console.error(e);
        }
    }

    connectedCallback() {
        this.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("clicked");
            const href = this.getAttribute('href');
            // const text = this.getAttribute('text') || this.innerHTML;
            // this.innerHTML = text;
            window.history.pushState({}, '', href);
            Link.navigateTo(href);
            // window.dispatchEvent(new PopStateEvent('popstate'));
        });
    }
}

customElements.define('co-link', Link, {extends: 'a'});
