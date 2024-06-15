import Http from "../http/http.js";

export default class MatchMaking extends HTMLElement{
  constructor(){
	super();
	this.user = Http.user;
  }
  connectedCallback(){
	const websocket = new WebSocket("ws://localhost:8000/ws/matchmaking/");
	websocket.onopen = () => {
		console.log("Connected to the server");
	};
	console.log(this.user);
	this.render();
  }
  render(){
	this.innerHTML = /*html*/`
		<h1>Looking for opponent</h1>
		<div class="matchmaking">
			<div className="mm_player1">
				<matchmaking-avatar></matchmaking-avatar>
				<matchmaking-stats></matchmaking-stats>
				</div>
				<div class="vsPng"></div>
				<div className="mm_player2">
				<matchmaking-avatar></matchmaking-avatar>
				<matchmaking-stats></matchmaking-stats>
			</div>
		</div>
	`;
  }
}

customElements.define("match-making", MatchMaking);
