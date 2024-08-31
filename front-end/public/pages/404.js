export default class Error404 extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="not_found_wrapper">
        <h1 id="not_found_status">404</h1>
        <h1>Desired resource not found</h1>
        <a is="co-link" href="/">Go back to home</a>
      </div
      `;
  }
}

customElements.define("app-404", Error404);