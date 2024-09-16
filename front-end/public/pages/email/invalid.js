export default class InvalideEmail extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = `
        <h1>Invalid Email</h1>
        <p>Sorry, the email you entered is invalid. Please try again.</p>
        <button onclick="">Resend verification email</button>
        `;
    }
}

customElements.define('invalid-email', InvalideEmail);