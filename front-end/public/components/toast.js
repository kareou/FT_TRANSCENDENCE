import Http from "../http/http.js";
import Link from "./link.js";

export default class Toast extends HTMLElement {
	constructor() {
		super();
		this.timeout = 5000;
		this.type = "info";
		Http.website_stats.addObserver({update: this.update.bind(this), event: "toast"});
	}

	// pushOldToastDown() {
	// 	const toasts = document.querySelectorAll(".toast");
	// 	toasts.forEach((toast) => {
	// 		console.log(toast);
	// 		const computedStyle = getComputedStyle(toast);
    //     	toast.style.top = `${parseInt(computedStyle.top) + 100}px`;
	// 	});
	// }

	connectedCallback() {
		// this.renderWarning();
	}

	removeToast() {
		const toast = document.querySelector(".toast");
		setTimeout(() => {
			toast.classList.add("remove")
			toast.addEventListener("animationend", () => {
				toast.remove();
			});
		}, 5000);
	}



	render(message) {
		this.innerHTML = /*HTML*/ `
		<div class="toast ">
			<div class="toast-wrapper ${this.type}">
				<div class="toast_wrapper">
					<label for="t-help" class="toast-icon ${this.type} icon-help"></label>
				</div>
				<div>
						<label for="t-help" class="close"></label>
						<h3>${this.type}!</h3>
						<p>${message}</p>
				</div>
				<button id="remove-toast" class="${this.type}">x</button>
			</div>
		</div>
		
	`;
	document.getElementById("remove-toast").addEventListener("click", () => {
		const toast = document.querySelector(".toast");
		toast.remove();
	}
	);}

	renderError(message) {
		this.innerHTML = /*HTML*/ `
		<div class="toast">
			<div class="toast-wrapper error">
			<label for="t-help" class="toast-icon error icon-error"></label>
			<div>
					<label for="t-help" class="close"></label>
					<h3>Error!</h3>
					<p>${message}</p>
				</div>
			</div>

		</div>
	`;
	}

	renderSuccess(message) {
		this.innerHTML = /*HTML*/ `
		<div class="toast ">
			<div class="toast-wrapper success">
			<label for="t-help" class="toast-icon success icon-success"></label>
			<div>
					<label for="t-help" class="close"></label>
					<h3>Success!</h3>
					<p>${message}</p>
				</div>
			</div>

		</div>
	`;
	}

	renderWarning(message) {
		this.innerHTML = /*HTML*/ `
		<div class="toast">
			<div class="toast-wrapper warning">
			<label for="t-help" class="toast-icon warning icon-warning"></label>
			<div>
					<label for="t-help" class="close"></label>
					<h3>Warning!</h3>
					<p>${message}</p>
				</div>
			</div>

		</div>
	`;
	}

	renderGameInvite(id, sender) {
		this.innerHTML = /*HTML*/ `
		<div class="toast ">
			<div class="toast-wrapper info">
				<div class="toast_wrapper">
					<label for="t-help" class="toast-icon info icon-help"></label>
				</div>
				<div>
						<label for="t-help" class="close"></label>
						<h3>info!</h3>
						<p>you are invited to a game </p>
				</div>
				<div>
					<button id="accept" class="info">Accept</button>
					<button id="remove-toast" class="info">Decline</button>
				</div>
				<button id="remove-toast" class="info">x</button>
			</div>
		</div>

		`;
		this.querySelector("#accept").addEventListener("click", () => {
			Http.notification_socket.send(JSON.stringify({type: "tournament_match", sender: Http.user.id, receiver: sender, message: id}));
			Link.navigateTo(`/game/online/?game_id=${id}`);
		});
	}

	update(data) {
		const type = data.type;
		switch (type) {
			case "error":
				this.type = "error";
				break;
			case "info":
				this.type = "info";
				break;
			case "success":
				this.type = "success";
				break;
			case "warning":
				this.type = "warning";
				break;
		}
		if (type !== "game_invite")
			this.render(data.message);
		else
			this.renderGameInvite(data.id, data.sender);
		this.removeToast();
	}

	disconnectedCallback() {
	}

}

customElements.define("c-toast", Toast);
