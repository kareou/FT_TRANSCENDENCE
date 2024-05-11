export default class Link extends HTMLAnchorElement {
    constructor() {
        super();
        // Set up your custom behavior here
    }
    connectedCallback() {
        this.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("in here");
            const href = this.getAttribute('href');
            // console.log("in here ", href);
            window.history.pushState({}, '', href);
            // window.dispatchEvent(new PopStateEvent('popstate'));
        });
    }
}

customElements.define('co-link', Link, {extends: 'a'});
