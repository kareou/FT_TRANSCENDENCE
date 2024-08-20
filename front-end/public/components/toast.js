import Http from "../http/http.js";

let toastCount = 0;

export default class Toast extends HTMLElement {
	constructor() {
		super();
		this.message = "sdfsf";
		this.type = "success";
		this.color = "";
		this.timeout = 3000;
		Http.website_stats.addObserver({update: this.update.bind(this), event: "toast"});
	}

	connectedCallback() {
		// const toast = document.querySelector(".toast");
		// setTimeout(() => {
		// 	// toast.style.transform = "translateX(0)";
		// 	// setTimeout(() => {
		// 	toast.remove();
		// 	// }, 500);
		// }, this.timeout);
	}

	pushOldToastDown() {
		const toasts = document.querySelectorAll(".toast");
		toasts.forEach((toast) => {
			console.log(toast);
			const computedStyle = getComputedStyle(toast);
        	toast.style.top = `${parseInt(computedStyle.top) + 100}px`;
		});
	}

	renderGameInviteToast(data) {
		const body = document.querySelector(".body_wrapper");
		const toast = document.createElement("div");
		toast.classList.add("toast");

		toast.innerHTML = /*HTML*/ `
		<div class="toast__content game_invite">
		<span>${data.message}</span>
		<div class="toast__content__actions">
		<button class="toast__content__actions__accept">
		<i class="fa-solid fa-check" style="color: white;"></i>
		</button>
		<button class="toast__content__actions__decline">
		<i class="fa-solid fa-xmark" style="color: white;"></i>
		</button>
		</div>
		</div>
		`;
		if (toastCount > 0) {
			this.pushOldToastDown();
		}

		body.appendChild(toast);
		toastCount++;
			setTimeout(() => {
				toast.classList.toggle("remove");
				toast.addEventListener("animationend", () => {
				toast.remove();
				toastCount--;
				});
			}, this.timeout);
	}

	checkToastType(data){
		if (data.type === "game_invite") {
			this.renderGameInviteToast(data);
		}

	}

	update(message) {
		console.log("message", message);
		this.checkToastType(message);
	}

	disconnectedCallback() {
	}

	// render() {
	// 	this.innerHTML = /*HTML*/ `
	// 	<div class="toast">
	// 	</div>
	// `;
	// }
}

customElements.define("c-toast", Toast);
