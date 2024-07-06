export default class Tournament extends HTMLElement {
	constructor() {
		super();
		this.first_round_part_2 = '<div class="match">	<div class="player">		<h1 id="player_name">TBA</h1>	</div>	<div class="player">		<h1 id="player_name">TBA</h1>	</div></div><div class="match">	<div class="player">		<h1 id="player_name">TBA</h1>	</div>	<div class="player">		<h1 id="player_name">TBA</h1>	</div></div>';
		this.second_round = '<div class="second_round">	<div class="match">		<div class="player">			<h1 id="player_name">TBA</h1>		</div>		<div class="player">			<h1 id="player_name">TBA</h1>		</div>	</div> <div class="match">		<div class="player">			<h1 id="player_name">TBA</h1>		</div>		<div class="player">			<h1 id="player_name">TBA</h1>		</div>	</div></div>';
		this.players = [];
	}
	connectedCallback() {
		this.render();
		this.addPlayer = this.querySelector('#addPlayer');
		this.addPlayer.addEventListener('click', this.addPlayerHandler.bind(this));
		const startGame = this.getElementById('start');
		startGame.addEventListener('click', () => {
			if (this.players.length === 4 || this.players.length === 8) {
				const players = this.players;
				const tournament = new Tournament(players);
				tournament.start();
			} else {
				alert('Player number can be 4 or 8');
			}
		}
		);
	}

	render() {
		this.innerHTML = /*html*/`
			<div class="generate_tournament">
				<h1>Add player to tournament <span id="note">player number can be 4 or 8</span></h1>
				<div class="input-group">
					<input type="text" id="player" placeholder="Enter player name" />
					<button id="addPlayer">Add Player</button>
				</div>
			</div>
			<div class="tournament">
				<h1>Tournament</h1>
				<div class="bracket">
					<div id="first_round" class="round">
						<div class="match">
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
						</div>
						<div class="match">
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
						</div>
					</div>
					<div id="last_round" class="round">
						<div class="match">
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
							<div class="player">
								<h1 id="player_name">TBA</h1>
							</div>
						</div>
					</div>
				</div>
				<button id="start" disabled>start the game</button>
			</div>
		`;
	}

	renderPlayers(player) {
		const tournament = this.querySelector('#first_round');
		const playersName =  tournament.getElementsByTagName('h1')
		for (let i = 0; i < playersName.length; i++) {
			if (playersName[i].textContent === 'TBA') {
				playersName[i].textContent = player;
				break;
			}
		}
	}

	addPlayerHandler() {
		const player = this.querySelector('#player').value;
		if (player) {
			this.players.push(player);
			if (this.players.length === 4 || this.players.length === 8)
				document.getElementById('start').removeAttribute('disabled');
			else
				document.getElementById('start').setAttribute('disabled', 'disabled');
			if (this.players.length === 8){
				document.getElementById("addPlayer").setAttribute('disabled', 'disabled');
			}
			this.renderPlayers(player);
			this.querySelector('#player').value = '';
		}
	}
}

customElements.define('tournament-page', Tournament);
