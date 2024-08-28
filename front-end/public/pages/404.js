export default class Error404 extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <h1>404</h1>
      <p>Page not found</p>
    `;
  }
}

customElements.define("app-404", Error404);