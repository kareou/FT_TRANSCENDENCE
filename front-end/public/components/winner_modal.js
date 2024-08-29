import Link from "./link.js";

export default class WinnerModal extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.type = this.getAttribute("type");
        this.redirectToDashboard();
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name === "type"){
            this.type = newValue;
            this.render();
        }
    }

    redirectToDashboard(){
        let time = 5;
        this.render();
        const timer = document.getElementById("return_timer");
        setInterval(() => {
            time -= 1;
            if(time === 0){
                this.remove();
                Link.navigateTo("/dashboard");
            }
            timer.innerText = `back to dashboard in ${time} ...`;
        }, 1000);
    }

    render(){
        this.innerHTML = /*html*/`
            <div class="modal">
                <div class="modal_content">
                    <h1 id="player_type" class="${this.type}">you ${this.type} </h1>
                    <h1 id="return_timer">back to dashboard in 5 ...</h1>
                </div>
            </div>
        `;
    }
}

customElements.define("winner-modal", WinnerModal);
