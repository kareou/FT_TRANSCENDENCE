export default class PaddleOption extends HTMLElement {
  constructor() {
    super();
	this.player = this.getAttribute("player");
    this.paddles = ["classic", "blossom", "lightsaber"];
	this.current_paddle = 0;
  }

  connectedCallback() {
	this.changeGameState();
    this.render();
	this.setupEvents();
  }

  render() {
    this.innerHTML = /*html*/ `
	<div class="paddle_picker">
		<button class="${this.player} paddle_swipe_left"><</button>
		<div class="paddle_info">
			<h1>${this.paddles[this.current_paddle]}</h1>
			<div class="paddle ${this.paddles[this.current_paddle]}"></div>
		</div>
		<button class="${this.player} paddle_swipe_right">></button>
	</div>
	`;
  }

  setupEvents() {
	const swipe_left = document.querySelector(`.${this.player}.paddle_swipe_left`);
	const swipe_right = document.querySelector(`.${this.player}.paddle_swipe_right`);

	swipe_left.onclick = () => this.changePaddle(-1);
	swipe_right.onclick = () => this.changePaddle(1);
}

  changePaddle(direction) {
    this.current_paddle += direction;
    if (this.current_paddle < 0) this.current_paddle = this.paddles.length - 1; // Loop back to the last paddle
    else if (this.current_paddle >= this.paddles.length) this.current_paddle = 0; // Loop back to the first paddle
	this.changeGameState();
	this.render();
	this.setupEvents();
  }
  changeGameState() {
	const state = localStorage.getItem("state");
	var data = JSON.parse(state);
	data[0][this.player].paddle_theme = this.paddles[this.current_paddle];
	localStorage.setItem("state", JSON.stringify(data));
  }
}

customElements.define("paddle-option", PaddleOption);
