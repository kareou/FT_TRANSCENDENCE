import Link from "../components/link.js";
export default class GamePage extends HTMLElement {
  constructor() {
    super();
    this.player1_ready = false;
    this.player2_ready = false;
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
    this.handlePlayerReady();
    const start_ev = document.querySelector("#start_ev");

    const themes = document.querySelector(".themes");

    let table_theme = "mod";
    themes.addEventListener("click", (e) => {
      table_theme = e.target.id;
    });

    const theme = document.querySelectorAll(".theme");

    theme.forEach((th) => {
      th.addEventListener("click", (e) => {
        theme.forEach((theme_) => {
          theme_.classList.remove("selected_theme");
        });
        th.classList.add("selected_theme");
      });
    });

    start_ev.addEventListener("click", (e) => {
      e.preventDefault();
      let count_down = 3;
      start_ev.setAttribute("disabled", true);
      const player1_input = document.querySelector("#player_1_input");
      const player2_input = document.querySelector("#player_2_input");
      // Create an object with the data
      let state = localStorage.getItem("state");
      state = JSON.parse(state);
      state[0].player1.name = player1_input.value;
      state[0].player2.name = player2_input.value;
      state[0].table_theme = table_theme;
      localStorage.setItem("state", JSON.stringify(state));
      start_ev.innerText = `Starting in ${count_down}`;
      setInterval(() => {
        count_down -= 1;
        if (count_down === -1) {
          Link.navigateTo("/gameplay");
        }
        start_ev.innerText = `Starting in ${count_down}`;
      }, 1000);
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
            <button class="ready_button" id="p1_ready">Ready</button>
          </div>
          <div class="player2">
            <h1 id="roles">Player 2</h1>
            <input type="text" name="player_2_input" id="player_2_input">
            <paddle-option player="player2" class="player2_paddle" ></paddle-option>
            <button class="ready_button" id="p2_ready">Ready</button>
        </div>
    </div>
    <div class="game_theme">
        <h1>Table Theme</h1>
        <div class="themes">
            <button id="classic" class="theme"></button>
            <button id="mod" class="theme selected_theme"></button>
            <button id="sky" class="theme"></button>
        </div>
    </div>
    <div class="start_game">
      <button id="start_ev" disabled>Start Game</button>
    </div>
</div>
`;
  }

  validateReadyButton(player_id) {
    const player = document.querySelector(`#${player_id}`);
    let player_name = player.value.trim();
    if (player_name === "") {
      return false;
    }
    return true;
  }

  handlePlayerReady() {
    const p1_ready = document.querySelector("#p1_ready");
    const p2_ready = document.querySelector("#p2_ready");

    p1_ready.addEventListener("click", () => {

      if (!this.player1_ready){
        this.player1_ready = this.validateReadyButton("player_1_input");
        if (!this.player1_ready){
          const p1_input = document.querySelector("#player_1_input");
          p1_input.classList.add("shake");
          p1_input.style.border = "1px solid red";
          setTimeout(() => {
            p1_input.classList.remove("shake")
          }, 500);
        }
      }
      else
        this.player1_ready = false;
       this.updateReadyButton("p1_ready", this.player1_ready);
    });

    p2_ready.addEventListener("click", () => {
      if (!this.player2_ready){
        this.player2_ready = this.validateReadyButton("player_2_input");
        if (!this.player2_ready){
          const p2_input = document.querySelector("#player_2_input");
          p2_input.classList.add("shake");
          p2_input.style.border = "1px solid red";
          setTimeout(() => {
            p2_input.classList.remove("shake")
          }, 500);
        }
      }
      else
        this.player2_ready = false;
      this.updateReadyButton("p2_ready", this.player2_ready);
    });
  }

  updateReadyButton(buttonId, isReady) {
    const button = document.querySelector(`#${buttonId}`);
    console.log(isReady, button);
    button.textContent = isReady ? "Ready" : "Ready";
    if (isReady)
      button.classList.add("active");
    else
      button.classList.remove("active");
    if (this.player1_ready && this.player2_ready) {
      const start_ev = document.querySelector("#start_ev");
      start_ev.removeAttribute("disabled");
    }
    else {
      const start_ev = document.querySelector("#start_ev");
      start_ev.setAttribute("disabled", true);
    }
  }
}

customElements.define("game-page", GamePage);
