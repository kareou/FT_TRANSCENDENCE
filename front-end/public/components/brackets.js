export default class Brackets extends HTMLElement{
    constructor(){
        super();
        this.players = [
            {name: "Player 1", score: 1},
            {name: "Player 2", score: 0},
            {name: "Player 3", score: 1},
            {name: "Player 4", score: 0},
            {name: "Player 5", score: 2},
            {name: "Player 6", score: 0},
            {name: "Player 7", score: 2},
            {name: "Player 8", score: 0},
        ];
    }

    connectedCallback(){
        this.render();
    }

    creacteStages(){
        const stages = [];
        for(let i = 0; i < 3; i++){
            stages.push(this.players.filter((player) => player.score >= i));
        }
        return stages.map((stage, index) => {
            return /*html*/`
                <div class="brackets__stage">
                    ${stage.map((player, index) => {
                        if (index % 2 === 0) {
                            const nextPlayer = stage[index + 1];
                            return /*html*/`
                                <ul class="brackets__player">
                                    <li>
                                    <span class="brackets__player-name">${player.name}</span>
                                    <span class="brackets__player-score">${player.score}</span>
                                    </li>
                                    <li>
                                    <span class="brackets__player-name">${nextPlayer.name}</span>
                                    <span class="brackets__player-score">${nextPlayer.score}</span>
                                    </li>
                                </ul>
                            `;
                        }
                    }).join("")}
                </div>
            `;
        }).join("");
    }

    render(){
        this.innerHTML = /*html*/`
            <div class="start_bracket" style="color: white; display:flex;justify-content:space-around;align-items:center;">
                ${this.creacteStages()}
            </div>
        `;
    }
}

customElements.define("tournament-brackets", Brackets);