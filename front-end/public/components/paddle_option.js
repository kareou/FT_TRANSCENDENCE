export default class PaddleOption extends HTMLElement {
  constructor() {
	super();
	this.selected = "";
	this.owner = this.getAttribute("owner");
  }

  connectedCallback() {
	this.render();
	document.addEventListener("click", (e) => {
		if (e.target.classList.contains("paddle_type")) {
			this.selected = this.owner + e.target.id;
		}
	});
	}

  render() {
	this.innerHTML = /*html*/ `
	<div class="paddle_option ${this.owner}">
		<button class="paddle_type ${this.selected === this.owner + "classix_paddle" ? "activate" : ""}
		" id="classix_paddle">
			<h3>classic</h3>
			<div class="paddle" style="background-color: white;"></div>
		</button>
		<button class="paddle_type ${this.selected === this.owner + "test" ? "activate" : ""}" id="test">
			<h3>test</h3>
			<div class="paddle" style="background-color: lightpink;"></div>
		</button>
		<button class="paddle_type ${this.selected === this.owner + "beach" ? "activate" : ""}" id="beach">
			<h3>beach</h3>
			<div class="paddle" style="background-color: red;"></div>
		</button>
	</div>
	`;
  }
}

customElements.define("paddle-option", PaddleOption);
