export default class Toast extends HTMLElement {
	constructor() {
		super();
		this.message = "sdfsf";
		this.type = "success";
		this.color = "";
		this.timeout = 5000;
	}

	connectedCallback() {
		// const colors = {
		// 	"success": "#4CAF50",
		// 	"error": "#F44336",
		// 	"info": "#2196F3",
		// 	"warning": "#FFC107",
		// }
		// this.color = colors[this.type];
		this.render();
		// 	const toast = document.querySelector(".toast");
		// 	setTimeout(() => {
		// 		// toast.style.transform = "translateX(0)";
		// 		// setTimeout(() => {
		// 		toast.remove();
		// 		// }, 500);
		// 	}, this.timeout);
	}

	update(message, type, timeout) {
		this.message = message;
		this.type = type;
		this.connectedCallback();
	}

	disconnectedCallback() {
	}

	render() {
		this.innerHTML = /*HTML*/ `
		<div class="toast">
			<div class="toast-wrapper">
			<label for="t-help" class="toast-icon icon-help"></label>
			<div>
					<label for="t-help" class="close"></label>
					<h3>Help!</h3>
					<p>Do you have a problem? Just use this</p>
				</div>
			</div>

		</div>
	`;
	}
}

customElements.define("c-toast", Toast);
