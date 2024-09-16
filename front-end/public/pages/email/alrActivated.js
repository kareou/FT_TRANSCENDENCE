export default class AlrActivated extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = `
        <h1>Already Activated</h1>
        <p>Your email has already been activated. Please login to continue.</p>
        <a href="/pages/login/login.html">Go to login page</a>
        `;
    }
}

customElements.define('alr-activated', AlrActivated);