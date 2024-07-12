export default class GameStarter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
    <a is="co-link" href="/gameplaye">Start Game</a>
    `
    }
}

customElements.define("game-starter", GameStarter);