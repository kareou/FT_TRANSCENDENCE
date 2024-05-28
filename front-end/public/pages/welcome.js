export default class Welcome extends HTMLElement {
  constructor() {
    super();
    document.title = "welcome";
  }

  connectedCallback() {
    fetch("http://localhost:8000/game/")
      .then((response) => {
        console.log("Response Headers:", [...response.headers.entries()]);
        console.log(response);
      })
      .catch((error) => {
        console.log("erro", error);
      });
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
        <div class="lets-start-div">
    <h1 class="welcome-text">Welcome To Our <br> Trancendence</h1>
    <a is="co-link" href="/signin" class="lets-start-btn">Let's start</a>
  </div>
        `;
  }
}

customElements.define("welcome-page", Welcome);
