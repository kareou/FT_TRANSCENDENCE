export default class Link extends HTMLAnchorElement {
    constructor() {
        super();
        // Set up your custom behavior here
        this.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("clicked");
        });
    }
}

customElements.define('co-link', Link, {extends: 'a'});
