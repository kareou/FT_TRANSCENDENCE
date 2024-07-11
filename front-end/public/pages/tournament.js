export default class Tournament extends HTMLElement {
	constructor() {
		super();
		this.first_round_part_2 = '<div class="match">	<div class="player">		<h1 id="player_name">TBA</h1>	</div>	<div class="player">		<h1 id="player_name">TBA</h1>	</div></div><div class="match">	<div class="player">		<h1 id="player_name">TBA</h1>	</div>	<div class="player">		<h1 id="player_name">TBA</h1>	</div> <div class="match">		<div class="player">			<h1 id="player_name">TBA</h1>		</div>		<div class="player">			<h1 id="player_name">TBA</h1>		</div>	</div> </div>';
		this.second_round = '<div id="second_round" class="second_round">	<div class="match">		<div class="player">			<h1 id="player_name">TBA</h1>		</div>		<div class="player">			<h1 id="player_name">TBA</h1>		</div>	</div> <div class="match">		<div class="player">			<h1 id="player_name">TBA</h1>		</div>		<div class="player">			<h1 id="player_name">TBA</h1>		</div>	</div></div>';
		this.players = [];
		this.data = {};
	}
	connectedCallback() {
		this.render();
		this.addPlayer = this.querySelector('#addPlayer');
		this.addPlayer.addEventListener('click', this.addPlayerHandler.bind(this));
		const startGame = document.getElementById('start');
		startGame.addEventListener('click', () => {
			if (this.players.length === 4 || this.players.length === 8) {
				this.generateBracket();
			} else {
				alert('Player number can be 4 or 8');
			}
		}
		);
		document.addEventListener('click', (e) => {
			if (e.target.tagName === "LABEL") {
				document.querySelectorAll('input[type="radio"]').forEach((radio) => {
					radio.removeAttribute('checked');
				}
				);
				e.target.previousElementSibling.setAttribute('checked', 'checked');
			}
		}
		);
	}

	getPlayers() {
		let players = '';
		for (let i = 0; i < this.players.length; i += 2) {
			players += /*html*/`
				<div class="match">
					<div class="player">
						<h1 id="player_name">${this.players[i]}</h1>
					</div>
					<div class="player">
						<h1 id="player_name">${this.players[i + 1]}</h1>
					</div>
				</div>
			`;
		}
		return players;
	}

	fourPlayersBracket(bracket) {
		bracket.innerHTML = /*html*/`
			<div class="first_round">
				${this.getPlayers()}
			</div>
			<div class="last_round">
				<div class="match">
				<div class="player">
					<h1 id="player_name">TBA</h1>
				</div>
				<div class="player">
					<h1 id="player_name">TBA</h1>
				</div>
			</div>
			</div>
			`
	}

	eightPlayersBracket(bracket) {
		bracket.innerHTML = /*html*/`
			<div class="first_round">
				${this.getPlayers()}
			</div>
			${this.second_round}
			<div class="last_round">
				<div class="match">
				<div class="player">
					<h1 id="player_name">TBA</h1>
				</div>
				<div class="player">
					<h1 id="player_name">TBA</h1>
				</div>
			</div>
		`;
	}

	shufflePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
	}

	generateBracket() {
		this.shufflePlayers();
		const request = window.indexedDB.open('tournament', 1);
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			const objectStore = db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
		};
		request.onsuccess = (event) => {
			const db = event.target.result;
			const transaction = db.transaction(['players'], 'readwrite');
			const objectStore = transaction.objectStore('players');
			this.players.forEach(player => {
				const request = objectStore.add({ name: player, paddle: "classic" });
				request.onsuccess = () => {
					console.log('added');
				};
			});
		}
		const bracket = this.querySelector('.bracket');
		if (this.players.length === 4)
			this.fourPlayersBracket(bracket);
		else
			this.eightPlayersBracket(bracket);
	}

	render() {
		this.innerHTML = /*html*/`
			<div class="tournament_wrapper">
			<div class="generate_tournament">
				<h1>Add player to tournament <span id="note">player number can be 4 or 8</span></h1>
				<div class="input-group">
					<input type="text" id="player" placeholder="Enter player name" />
					<div class="paddles">
					<input type="radio" name="paddle1" id="classic_paddle" />
					<label for="paddle1"></label>
					<input type="radio" name="paddle2" id="blossom_paddle" />
					<label for="paddle2"></label>
					<input type="radio" name="paddle3" id="lightsaber_paddle" />
					<label for="paddle3"></label>
					</div>
					<button id="addPlayer">Add Player</button>
				</div>
			</div>
			<div class="tournament">
				<button id="start" disabled>generate Bracket</button>
				<div class="tournament_player">
					<h1>Player : </h1>
				</div>
				<h1>Tournament</h1>
				<div class="bracket">
				</div>
				</div>
			</div>
		`;
	}

	renderPlayers() {
		const players = this.querySelector('.tournament_player');
		this.players.forEach(player => {
			const playerDiv = document.createElement('div');
			playerDiv.className = 'player_name';
			playerDiv.innerHTML = `<h1>${player} ,</h1>`;
			players.appendChild(playerDiv);
		});
	}

	addPlayerHandler() {
		const player = this.querySelector('#player').value;
		if (player) {
			this.players.push(player);
			if (this.players.length === 4 || this.players.length === 8)
				document.getElementById('start').removeAttribute('disabled');
			else
				document.getElementById('start').setAttribute('disabled', 'disabled');
			if (this.players.length === 8) {
				document.getElementById("addPlayer").setAttribute('disabled', 'disabled');
			}
			this.renderPlayers();
			this.querySelector('#player').value = '';
		}
	}
}

customElements.define('tournament-page', Tournament);
