export default class GamePage extends HTMLElement {
    constructor() {
        super();
        this.theme_selected = "";
    }

    connectedCallback() {

        this.render();
        const player1_paddle = document.querySelector(".player1");
        const player2_paddle = document.querySelector(".player2");
        
        let player1_paddle_data = "classic";
        let player2_paddle_data = "classic";

        player1_paddle.addEventListener("click", (e) => {
            player1_paddle_data = e.target.id;
            console.log(player1_paddle_data);
        });

        player2_paddle.addEventListener("click", (e) => {
            player2_paddle_data = e.target.id;
            console.log(player2_paddle_data);
        });

        console.log(player1_paddle);
        console.log(player2_paddle);

        const start_ev = document.querySelector("#start_ev");

        console.log(start_ev);
        const themes = document.querySelector(".themes");

        let table_theme = "classic";
        themes.addEventListener("click", (e) => {
            table_theme = e.target.id;

        });

        const theme = document.querySelectorAll(".theme");


        theme.forEach((th) => {
            th.addEventListener("click", (e) => { 
                theme.forEach((theme_) => {
                    theme_.classList.remove("selected_paddle");
                });
                th.classList.add("selected_paddle");
            });
        });

        start_ev.addEventListener("click", (e) => {
            e.preventDefault();
            const player1_input = document.querySelector("#player_1_input");
            const player2_input = document.querySelector("#player_2_input");
            const player1_paddle = document.querySelector(".player1_paddle");
            const player2_paddle = document.querySelector(".player2_paddle");

            // Create an object with the data
            const data = [
                {"player1" : {
                    name: player1_input.value,
                    paddle_theme: player1_paddle_data
                },
                "player2" : {
                    name: player2_input.value,
                    paddle_theme: player2_paddle_data
                },
                "table_theme": table_theme
                }
            ];

            // Save the data to the state
            localStorage.setItem("state", JSON.stringify(data));
            window.location.href = "/gameplay";
        });
    }


    render() {

this.innerHTML = `
<div class="game_page">
    <div class="players_info">
        <div class="player1">
            <h1>player 1</h1>
            <input type="text" name="player_1_input" id="player_1_input">
            <paddle-option owner="player1" class="player1_paddle"></paddle-option>
        </div>
        <div class="player2">
            <h1>player 2</h1>
            <input type="text" name="player_2_input" id="player_2_input">
            <paddle-option owner="player2" class="player2_paddle" ></paddle-option>
        </div>
    </div>
    <div class="game_theme">
        <h1>Table Theme</h1>
        <div class="themes">
            <button id="classic" class="theme"></button>
            <button id="mod" class="theme"></button>
            <button id="sky" class="theme"></button>
        </div>
    </div>
    <div class="game_start">
        <a href="/gameplay" id="start_ev" >Start Game</button>
    </div>  
</div>
`;
    }
}

customElements.define("game-page", GamePage);
