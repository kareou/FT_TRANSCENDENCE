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
    <div class="players_info">
        <div class="player1">
            <h1>player 1</h1>
            <input type="color" name="" id="">
            <paddle-option owner="player1"></paddle-option>
        </div>
        <div class="player2">
            <h1>player 2</h1>
            <input type="color" name="" id="">
            <paddle-option owner="player2"></paddle-option>
        </div>
    </div>
    <div class="game_theme">
        <h1>Table Theme</h1>
        <div class="themes">
            <button id="classic" class="theme" ></button>
            <button id="mod" class="theme"></button>
            <button id="sky" class="theme"></button>
        </div>
    </div>
</div>
`;
}
}

customElements.define("game-page", GamePage);
