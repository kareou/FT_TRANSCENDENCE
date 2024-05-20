export default class GamePage extends HTMLElement {
  constructor() {
    super();
    this.theme_selected = "";
  }

  connectedCallback() {
    const data = [
      {
        player1: {
          name: "",
          paddle_theme: "",
        },
        player2: {
          name: "",
          paddle_theme: "",
        },
        table_theme: "",
      },
    ];
    localStorage.setItem("state", JSON.stringify(data));
    this.render();

    const start_ev = document.querySelector("#start_ev");

    const themes = document.querySelector(".themes");

    let table_theme = "classic";
    themes.addEventListener("click", (e) => {
      table_theme = e.target.id;
    });

    const theme = document.querySelectorAll(".theme");

    theme.forEach((th) => {
      th.addEventListener("click", (e) => {
        theme.forEach((theme_) => {
          theme_.classList.remove("selected_paddle");
        });
        th.classList.add("selected_paddle");
      });
    });

    start_ev.addEventListener("click", (e) => {
      e.preventDefault();
      const player1_input = document.querySelector("#player_1_input");
      const player2_input = document.querySelector("#player_2_input");
      if (player1_input.value === "" || player2_input.value === "") {
        alert("Please enter the player names");
        return;
      }
      // Create an object with the data
      let state = localStorage.getItem("state");
      state = JSON.parse(state);
      state[0].player1.name = player1_input.value;
      state[0].player2.name = player2_input.value;
      state[0].table_theme = table_theme;
      localStorage.setItem("state", JSON.stringify(state));

      window.location.href = "/gameplay";
    });
  }

  render() {
    this.innerHTML = /*html*/ `
<div class="game_page">
    <div class="players_info">
        <div class="player1">
            <h1 id="roles">Player 1</h1>
            <input type="text" name="player_1_input" id="player_1_input">
            <paddle-option player="player1" class="player1_paddle"></paddle-option>
        </div>
        <div class="player2">
            <h1 id="roles">Player 2</h1>
            <input type="text" name="player_2_input" id="player_2_input">
            <paddle-option player="player2" class="player2_paddle" ></paddle-option>
        </div>
    </div>
    <div class="game_theme">
        <h1>Table Theme</h1>
        <div class="themes">
            <button id="classic" class="theme"></button>
            <button id="mod" class="theme"></button>
            <button id="sky" class="theme"></button>
        </div>
    </div>
    <div class="start_game">
      <a as="co-link" href="/gameplay" id="start_ev" >Start Game</a>
    </div>
</div>
`;
  }
}

customElements.define("game-page", GamePage);
