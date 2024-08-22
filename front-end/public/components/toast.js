export default class Toast extends HTMLElement {
	constructor() {
		super();
		this.message = "sdfsf";
		this.type = "success";
		this.color = "";
		this.timeout = 5000;
	}

	connectedCallback() {
		const colors = {
			"success": "#4CAF50",
			"error": "#F44336",
			"info": "#2196F3",
			"warning": "#FFC107",
		}
		this.color = colors[this.type];
		this.render();
		const toast = document.querySelector(".toast");
		setTimeout(() => {
			// toast.style.transform = "translateX(0)";
			// setTimeout(() => {
			toast.remove();
			// }, 500);
		}, this.timeout);
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
			<div class="toast-body">
				${this.message}
			</div>
			<div class="timer">
				<div class="timer-bar" style="background-color: ${this.color}; animation: timer ${this.timeout}ms ease-in-out;"></div>
			</div>
		</div>
	`;
	}
}

customElements.define("c-toast", Toast);
