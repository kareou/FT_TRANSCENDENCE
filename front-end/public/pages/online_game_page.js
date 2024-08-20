import Link from "../components/link.js";

export default class OnlineGamePage extends HTMLElement {
	constructor() {
		super();
		this.role = "";
		this.theme_selected = "";
		this.player1_ready = false;
		this.player2_ready = false;
		this.websocket = null;
	}

	connectedCallback() {
		this.websocket = new WebSocket("ws://localhost:8000/ws/lobby/lobby/");
		this.websocket.onmessage = function (e) {
			const message = JSON.parse(e.data);
			if (message.role) {
				this.role = message.role;
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
				this.setupEvents();
			}
			if (message.game_data) {
				const state = JSON.parse(localStorage.getItem("state"));
				if (message.game_data.player1) {
					state[0].player1.name = message.game_data.player1.name;
					state[0].player1.paddle_theme = message.game_data.player1.paddle_theme;
				}
				if (message.game_data.player2) {
					state[0].player2.name = message.game_data.player2.name;
					state[0].player2.paddle_theme = message.game_data.player2.paddle_theme;
				}
				localStorage.setItem("state", JSON.stringify(state));
				// this.render();
			}
			if (message.start_game) {
				let count_down = 3;
				const start_ev = document.querySelector("#start_ev");
				document.querySelector("#p1_ready").setAttribute("disabled", true);
				document.querySelector("#p2_ready").setAttribute("disabled", true);
				start_ev.setAttribute("disabled", true);
				start_ev.innerText = `Starting in ${count_down}`;
				setInterval(() => {
					count_down -= 1;
					if (count_down === -1) {
						Link.navigateTo("/gameplay/?game_id=" + message.start_game);
					}
					start_ev.innerText = `Starting in ${count_down}`;
				}, 1000);
			}
		}.bind(this);
	}

	render() {
		this.innerHTML = /*html*/ `
		<div class="game_page">
			<div class="players_info">
				<div class="player1">
					<h1 id="roles">Player 1</h1>
					<input type="text" name="player_1_input" id="player_1_input" ${this.role === "player2" ? "disabled" : ""}>
					<paddle-option player="player1" class="player1_paddle"></paddle-option>
					<button class="ready_button" id="p1_ready" id="p1_ready">ready</button>
				</div>
				<div class="player2">
					<h1 id="roles">Player 2</h1>
					<input type="text" name="player_2_input" id="player_2_input" ${this.role === "player1" ? "disabled" : ""}>
					<paddle-option player="player2" class="player2_paddle" ></paddle-option>
					<button class="ready_button" id="p2_ready">ready</button>
				</div>
			</div>
			<div class="game_theme">
				<h1>Table Theme</h1>
				<div class="themes">
					<button id="classic" class="theme" ${this.role === "player2" ? "disabled" : ""}></button>
					<button id="mod" class="theme selected_theme" ${this.role === "player2" ? "disabled" : ""}></button>
					<button id="sky" class="theme" ${this.role === "player2" ? "disabled" : ""}></button>
				</div>
			</div>
			<div class="start_game">
      			<button id="start_ev" ${this.role === "player2" ? "disabled" : ""}>Start Game</button>
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

	setupEvents() {
		const start_ev = document.querySelector("#start_ev");
		const themes = document.querySelector(".themes");
		let table_theme = "mod";
		themes.addEventListener("click", (e) => {
			table_theme = e.target.id;
		});
		document.querySelector("#p2_ready").addEventListener("click", (e) => {
			if (!this.player2_ready) {
				this.player2_ready = this.validateReadyButton("player_2_input");
				if (!this.player2_ready) {
					const p2_input = document.querySelector("#player_2_input");
					p2_input.style.border = "1px solid red";
					p2_input.classList.add("shake");
					setTimeout(() => {
						p2_input.classList.remove("shake");
					}, 500);
				}
				else {
					this.websocket.send(JSON.stringify({
						game_data: {
							player2: {
								name: document.querySelector("#player_2_input").value,
								paddle_theme: localStorage.getItem("state") ? JSON.parse(localStorage.getItem("state"))[0].player2.paddle_theme : "classic"
							},
							ready: true
						}
					}));
				}
			}
			else
				this.player2_ready = false;
			this.updateReadyButton("p2_ready", this.player2_ready);
		});
		document.querySelector("#p1_ready").addEventListener("click", (e) => {
			if (!this.player1_ready) {
				this.player1_ready = this.validateReadyButton("player_1_input");
				if (!this.player1_ready) {
					const p1_input = document.querySelector("#player_1_input");
					p1_input.classList.add("shake");
					p1_input.style.border = "1px solid red";
					setTimeout(() => {
						p1_input.classList.remove("shake");
					}, 500);
				}
				else {
					this.websocket.send(JSON.stringify({
						game_data: {
							player1: {
								name: document.querySelector("#player_1_input").value,
								paddle_theme: localStorage.getItem("state") ? JSON.parse(localStorage.getItem("state"))[0].player1.paddle_theme : "classic"
							},
							ready: true,
							table_theme: table_theme
						}
					}));
				}
			}
			else
				this.player1_ready = false;
			this.updateReadyButton("p1_ready", this.player1_ready);
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
			if (this.role === "player1") {
				this.websocket.send(JSON.stringify({
					start_game: true
				}));
			}
		});
	}
	updateReadyButton(buttonId, isReady) {
		const button = document.querySelector(`#${buttonId}`);
		button.textContent = isReady ? "Ready" : "Ready";
		if (isReady)
			button.classList.add("active");
		else
			button.classList.remove("active");
	}
	generateGameId() {
		return Math.floor(Math.random() * 1000000);
	}
}

customElements.define("online-game-page", OnlineGamePage);
