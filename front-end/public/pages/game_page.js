export default class GamePage extends HTMLElement {
constructor() {
super();
}

connectedCallback() {
this.render();
}

render() {
this.innerHTML = `
<div class="game_page">

    <div class="modes">
        <button id="normal">1vs1</button>
        <button id="tournament">Tournament (coming soon...)</button>
    </div>
    <div class="game_params">
    </div>
    <game-starter></game-starter>
</div>
`;
}
}

customElements.define("game-page", GamePage);