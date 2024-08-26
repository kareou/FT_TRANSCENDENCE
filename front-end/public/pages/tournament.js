export default class Tournament extends HTMLElement {
    constructor() {
        super();
        this.socket = null;  // Store the WebSocket connection here
        this.userId = 1;  // Set the predefined user ID here
    }

    connectedCallback(data) {
        this.setupWebSocket();
        this.render();
    }

    disconnectedCallback() {
        if (this.socket) {
            this.socket.close();     
        }
    }

    PlayerAlrExist(data, keys) {
        const brackets = this.querySelectorAll('.bracket_wrapper');
        let checker = false;
        brackets.forEach(bracket => {
            keys.forEach(key => {
                if (bracket.id == key){
                    checker = true;
                }
            })

        })
        return checker;
    }

    updateBracket(data) {

        // let keys = null;
        // if(data)
        //     keys= Object.keys(data.players_data);
        // // console.log("The keys of players_data are => ", keys);
        // let checker = true;
        // if (data.type == "tournament_created")
        // {
        //     const brackets = this.querySelectorAll('.bracket_wrapper');
        //     if (this.PlayerAlrExist(data, keys)) {
        //         console.log('Player already exist');
        //         return;
        //     }
            // console.log("The data of player is => ", data.id);
            // brackets.forEach(bracket => {
            //     if (bracket.id === "" && checker){
            //         console.log("The data of player is => ", data.players_data[keys[keys.length - 1]]);
            //         bracket.querySelector('.name_wrapper').innerHTML = data.players_data[keys[keys.length - 1]].username;
            //         bracket.querySelector('.img_user > img').src = data.players_data[keys[keys.length - 1]].image;
            //         bracket.id = keys[[keys.length - 1]];
            //         keys.shift();
            //         console.log("The keys SHIFTED are => ", keys);
            //         checker = false;
            //         console.log("The bracket id is => ", bracket);
            //         console.log("The keys are => ", keys);
            //         console.log("The checker ")
            //     }
            //     console.log("The bracket id is => ", bracket);
            // })
            // let keys = Object.keys(data.players_data);

            // console.log(keys);
    
    
            // console.log("the brackets data => ", brackets);
            // let i = 0;
            // keys.forEach(key => {
            //     // console.log("The key is => ", key);
            //     brackets[i].querySelector('.name_wrapper').innerHTML = data.players_data[key].username;
            //     brackets[i++].querySelector('.img_user > img').src = data.players_data[key].image;
            // })
            // }

    }

    setupWebSocket() {
        this.socket = new WebSocket('ws://localhost:8000/ws/tournament/');

        this.socket.onopen = (e) => {
            console.log("Connected to the WebSocket.");
            document.getElementById('status').innerHTML = 'Connected. Click "Join Tournament" to join.';
            document.getElementById('joinButton').disabled = false;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message from server: ", data);
            document.getElementById('status').innerHTML = `Match ${data.match_id} created between Player ${data.player1_id} and Player ${data.player2_id} player1_username: ${data.player1_username} player2_username: ${data.player2_username} player1_image: ${data.player1_image} player2_image: ${data.player2_image}`;
            this.updateBracket(data);
            // if (data.type === 'match_created') {
            //     console.log("The data is => ", data);
            //     window.location.href = `/game/online/?game_id=${data.match_id}`;
            // }
        };

        this.socket.onclose = (event) => {
            if (event.wasClean) {
                console.log(`Closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.error('Connection died');
            }
            document.getElementById('status').innerHTML = 'WebSocket connection closed.';
            document.getElementById('joinButton').disabled = true;
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            document.getElementById('status').innerHTML = 'Error connecting to WebSocket.';
            document.getElementById('joinButton').disabled = true;
        };
    }

    render() {
        this.innerHTML = /*html*/`
        <style>
        .bracket_wrapper{
            display: flex;
            align-items: center;
            border: 1px solid black;
            width: 230px;
            background-color: black;
            color: white;
            margin: 10px 0;
            padding: 5px 0;
        }
        .name_wrapper, 
        .img_user{
            padding: 0 10px;
        }
        
        .img_user > img{
            width: 40px;
            border-radius: 50%;
        }
        
        .bracket_wrapper:hover{
            background-color: rgb(62, 62, 62);
            cursor: pointer;
        }
        
        .matchup_wrapper{
            padding: 25px;
        }
        
        .brackets_wrapper{
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 50px;
        }
        
        .winner_brackets
        {
            border-left: 5px solid rgb(16, 190, 0);
        }
        
        .looser_brackets{
            border-left: 5px solid red;
            opacity: 0.5;
        }
        </style>
            <div class="tournament-container">
                <h1>Tournament</h1>
                <button id="joinButton" disabled>Join Tournament</button>
                <div id="status">Connecting to WebSocket...</div>
                <div class="brackets_wrapper">
        <div class="second_brackets">
            <div class="top_side">
                <div class="matchup_wrapper">
                    
                    <div class="bracket_wrapper winner_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                    <div class="bracket_wrapper looser_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                </div>
            </div>
            <div class="top_side">
                <div class="matchup_wrapper">

                    <div class="bracket_wrapper winner_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                    <div class="bracket_wrapper looser_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="third_brackets">
            <div class="top_side">
                <div class="matchup_wrapper">

                    <div class="bracket_wrapper winner_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                    <div class="bracket_wrapper looser_brackets">
                        <div class="img_user">
                            <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                                class="logo" alt="">
                        </div>
                        <div class="name_wrapper">
                            Loading
                        </div>
                    </div>
                </div>
            </div>
     
        </div>

    </div>
            </div>
        `;

        document.getElementById('joinButton').addEventListener('click', () => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    'command': 'join',
                    'player_id': this.userId  // Use the predefined user ID
                }));
                document.getElementById('status').innerHTML = 'Joining tournament...';
                document.getElementById('joinButton').disabled = true;
            } else {
                alert("WebSocket connection is not open. Please try again.");
            }
        });
    }
}

customElements.define('tournament-page', Tournament);
