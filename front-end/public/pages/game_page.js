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
        <div class="game_options">
            <game-option type="Time" incId="time_increment" decId="time_decrement" text="set game length"></game-option>
            <game-option type="Score" incId="score_increment" decId="score_decrement" text="max to score to win"></game-option>
        </div>
        <div class="players_choice">
            
        </div>
    </div>
    <game-starter></game-starter>
</div>
`;
}
}

customElements.define("game-page", GamePage);