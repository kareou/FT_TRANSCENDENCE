import Link from "../components/link.js";

export default class OnlineGamePage extends HTMLElement {
	constructor() {
	  super();
	  this.role = "";
	  this.theme_selected = "";
	  this.websocket = null;
	}

	connectedCallback() {
		this.websocket = new WebSocket("ws://10.11.2.2:8080/ws/lobby/lobby/");
		this.websocket.onmessage = function (e) {
			const message = JSON.parse(e.data);
			console.log(message);
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
			if (message.game_data){
				const state = JSON.parse(localStorage.getItem("state"));
				if (message.game_data.player1){
					state[0].player1.name = message.game_data.player1.name;
					state[0].player1.paddle_theme = message.game_data.player1.paddle_theme;
				}
				if (message.game_data.player2){
					state[0].player2.name = message.game_data.player2.name;
					state[0].player2.paddle_theme = message.game_data.player2.paddle_theme;
				}
				localStorage.setItem("state", JSON.stringify(state));
				this.render();
			}
			if (message.start_game){
				Link.navigateTo("/gameplay/?game_id=" + message.start_game);
			}
		}.bind(this);
	}

	render() {
	  this.innerHTML = /*html*/ `
		<div class="game_page">
			<div class="players_info">
				<div class="player1">
					<h1 id="roles">Player 1</h1>
					<input type="text" name="player_1_input" id="player_1_input" ${this.role === "player2"? "disabled" : ""}>
					<paddle-option player="player1" class="player1_paddle"></paddle-option>
					<button id="player1_ready">ready</button>
				</div>
				<div class="player2">
					<h1 id="roles">Player 2</h1>
					<input type="text" name="player_2_input" id="player_2_input" ${this.role === "player1"? "disabled" : ""}>
					<paddle-option player="player2" class="player2_paddle" ></paddle-option>
					<button id="player2_ready">ready</button>
				</div>
			</div>
			<div class="game_theme">
				<h1>Table Theme</h1>
				<div class="themes">
					<button id="classic" class="theme" ${this.role === "player2"? "disabled": ""}></button>
					<button id="mod" class="theme" ${this.role === "player2"? "disabled": ""}></button>
					<button id="sky" class="theme" ${this.role === "player2"? "disabled": ""}></button>
				</div>
			</div>
			<div class="start_game">
				<a as="co-link" href="/gameplay" id="start_ev" >Start Game</a>
			</div>
		</div>
  `;
	}

	setupEvents() {
		const start_ev = document.querySelector("#start_ev");
		const themes = document.querySelector(".themes");
		let table_theme = "classic";
		themes.addEventListener("click", (e) => {
		  table_theme = e.target.id;
		});
		document.querySelector("#player2_ready").addEventListener("click", (e) => {
			this.websocket.send(JSON.stringify({
				game_data :{
				player2 :{
					name: document.querySelector("#player_2_input").value,
					paddle_theme: localStorage.getItem("state") ? JSON.parse(localStorage.getItem("state"))[0].player2.paddle_theme : "classic"
				},
				ready: true
			}
			 }));
		});
		document.querySelector("#player1_ready").addEventListener("click", (e) => {
			this.websocket.send(JSON.stringify({
				game_data :{
				player1 :{
					name: document.querySelector("#player_1_input").value,
					paddle_theme: localStorage.getItem("state") ? JSON.parse(localStorage.getItem("state"))[0].player1.paddle_theme : "classic"
				},
				ready: true,
				table_theme: table_theme
			}
			 }));
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
			if (this.role === "player1")
			{
				this.websocket.send(JSON.stringify({
					start_game: true
				}));
			}
		});
	}

	generateGameId() {
	  return Math.floor(Math.random() * 1000000);}
  }

  customElements.define("online-game-page", OnlineGamePage);
