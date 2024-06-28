export default class MatchData extends HTMLElement{
    constructor(){
        super();
    }
    connectedCallback(){
        this.render();
    }
    render(){
        this.innerHTML = /*html*/`
            <div class="matchdata win">
                <div class="player">
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                    <h1>0</h1>
                </div>
                <h1>VS</h1>
                <div class="player">
                    <h1>0</h1>
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                </div>
            </div>
            <div class="matchdata lose">
                <div class="player">
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                    <h1>0</h1>
                </div>
                <h1>VS</h1>
                <div class="player">
                    <h1>0</h1>
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg" alt="avatar" />
                </div>
            </div>
        `;
    }
}

customElements.define("match-data", MatchData);