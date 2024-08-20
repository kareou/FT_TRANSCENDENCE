export default class MatchData extends HTMLElement{
    constructor(){
        super();
        this.user = this.getAttribute("user");
        this.p1 = this.getAttribute("p1");
        this.p2 = this.getAttribute("p2");
        this.p1score = this.getAttribute("p1score");
        this.p2score = this.getAttribute("p2score");
        this.winner = this.getAttribute("winner");
        
    }
    connectedCallback(){
        this.render();
    }
    render(){
        this.innerHTML = /*html*/`
            <div class="matchdata ${this.winner === this.user ? "win" : "lose"}">
                <div class="player">
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                    <h1>${this.p1score}</h1>
                </div>
                <h1>VS</h1>
                <div class="player">
                    <h1>${this.p2score}</h1>
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                </div>
            </div>
        `;
    }
}

customElements.define("match-data", MatchData);