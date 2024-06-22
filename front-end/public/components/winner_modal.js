import Link from "./link.js";

export default class WinnerModal extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.winner = this.getAttribute("winner");
        this.redirectToDashboard();
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(name, oldValue, newValue);
        if(name === "winner"){
            this.winner = newValue;
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
                    <h1>${this.winner} won</h1>
                    <h1 id="return_timer">back to dashboard in 5 ...</h1> 
                </div>
            </div>
        `;
    }
}

customElements.define("winner-modal", WinnerModal);