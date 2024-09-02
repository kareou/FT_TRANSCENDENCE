import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class Tournament extends HTMLElement {
  constructor() {
    super();
    this.socket = null; // Store the WebSocket connection here
    this.userId = 1; // Set the predefined user ID here
    Http.website_stats.addObserver({ event: "players_status_changed", update: this.update.bind(this) });
  }

  connectedCallback(data) {
    this.setupWebSocket();
    this.render();
    if (Http.tournament_data)
      this.updateBracket(Http.tournament_data);
    console.log("The tournament data is => ", Http.tournament_data);
  }

  update(data) {
    this.updateBracket(data);
  }

  disconnectedCallback() {
    if (this.socket) {
      this.socket.close();
    }
  }

  PlayerAlrExist(data, keys) {
    const brackets = this.querySelectorAll(".bracket_wrapper");
    let checker = false;
    brackets.forEach((bracket) => {
      keys.forEach((key) => {
        if (bracket.id == key) {
          checker = true;
        }
      });
    });
    return checker;
  }

  updateBracket(data) {
    const joinButton = document.getElementById("joinButton");
    const brackets_wrapper = document.querySelector(".brackets_wrapper");
    const first_tournament_page = document.querySelector(
      ".first_tournament_page"
    );
    joinButton.style.display = "none";
    first_tournament_page.style.display = "none";
    const second_round = document.querySelectorAll(".second_round");
    const first_round = document.querySelectorAll(".first_round");
    let counter = 0;
    let checker = true;

    first_round.forEach((bracket) => {
      if (data["first_round"].length == counter) checker = false;
      if (checker) {
        console.log("the length is => ", data["first_round"].length);
        console.log("the counter is => ", counter);
        // if (!data["first_round"][counter].online && data["second_round"])
        // {
        //   data["second_round"].forEach((second_round) => {
        //     if (second_round.id == data["first_round"][counter].id)
        //     {
        //       bracket.style.borderLeft = "5px solid green";
        //       bracket.style.opacity = "1";
        //       bracket.querySelector(".name_wrapper").textContent = second_round.username;
        //       bracket.querySelector(".img_user img").src = second_round.image;
        //     }
        //   });
        // }
        // if (data["first_round"][counter].online)
        // {
        if (!data["first_round"][counter].win) {
          bracket.style.borderLeft = "5px solid red";
          bracket.style.opacity = "0.5";
        }
        else {
          bracket.style.borderLeft = "5px solid green";
          bracket.style.opacity = "1";
        }

        bracket.querySelector(".name_wrapper").textContent =
          data["first_round"][counter].username;
        bracket.querySelector(".img_user img").src =
          data["first_round"][counter].image;
        // }
        // else
        // {
        //     bracket.querySelector(".name_wrapper").textContent ="loading"
        //     bracket.querySelector(".img_user img").src = "https://am-a.akamaihd.net/image?resize=72:72&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
        // }

      }
      counter++;
    });

    counter = 0;
    checker = true;
    second_round.forEach((bracket) => {
      if (data["second_round"].length == counter) checker = false;
      if (checker) {
        console.log("the length is => ", data["second_round"].length);
        console.log("the counter is => ", counter);
        bracket.querySelector(".name_wrapper").textContent =
          data["second_round"][counter].username;
        bracket.querySelector(".img_user img").src =
          data["second_round"][counter].image;

        if (!data["second_round"][counter].win) {
          bracket.style.borderLeft = "5px solid red";
          bracket.style.opacity = "0.5";
        }
        else {
          bracket.style.borderLeft = "5px solid green";
          bracket.style.opacity = "1";
        }

      }
      counter++;
    });

    brackets_wrapper.style.display = "flex";
  }

  setupWebSocket() {
    this.socket = new WebSocket(`${ips.socketUrl}/ws/tournament/`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server: ", data);
      document.getElementById(
        "status"
      ).innerHTML = `Match ${data.match_id} created between Player ${data.player1_id} and Player ${data.player2_id} player1_username: ${data.player1_username} player2_username: ${data.player2_username} player1_image: ${data.player1_image} player2_image: ${data.player2_image}`;
    };
    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `Closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.error("Connection died");
      }
      const statusElement = document.getElementById("status");
      if (statusElement)
      statusElement.innerHTML =
        "WebSocket connection closed.";
      const joinButtonElement = document.getElementById("joinButton");
      if (joinButtonElement)
      joinButtonElement.disabled = true;
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      document.getElementById("status").innerHTML =
        "Error connecting to WebSocket.";
      document.getElementById("joinButton").disabled = true;
    };
  }

  render() {
    this.innerHTML = /*html*/ `
      <style>
      .bracket_wrapper{
          display: flex;
          align-items: center;
          border: 1px solid black;
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

      .bracket_wrapper {
  display: flex;
  align-items: center;
  border: 1px solid black;
    border-left-width: 1px;
    border-left-style: solid;
    border-left-color: black;
  height: 80px;
  background-color: black;
  color: white;
  margin: 37px;
  padding: 5px 0;
  justify-content: center;
  align-items: center;
  padding: 0 100px 0 0;
}

.brackets_wrapper{
  justify-content: center;
  align-items: center;
}

      .tournament-container {
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

      .winner_brackets
      {
          border-left: 5px solid rgb(16, 190, 0);
      }

      .looser_brackets{
          border-left: 5px solid red;
          opacity: 0.5;
      }

      .first_tournament_page
      {
          height: 60vh;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
      }
      .brackets_wrapper{
          display: none;
      }
      #joinButton{
          margin: 15px 0;
          padding: 15px 43px;
          border-radius: 9px;
          border: none;
          background: #6d5a99;
          font-size: 19px;
          font-weight: bold;
          color: white;
          cursor: pointer;
      }
      #joinButton:hover{
          background: #4d3a79;
      }
      </style>
          <div class="tournament-container">
          <div class="first_tournament_page">
              <button id="joinButton" >Join Tournament</button>
              <div id="status">Connecting to WebSocket...</div>
          </div>
              <div class="brackets_wrapper">
      <div class="second_brackets">
          <div class="top_side">
              <div class="matchup_wrapper">

                  <div class="bracket_wrapper winner_brackets first_round">
                      <div class="img_user">
                          <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                              class="logo" alt="">
                      </div>
                      <div class="name_wrapper">
                          Loading
                      </div>
                  </div>
                  <div class="bracket_wrapper looser_brackets first_round">
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

                  <div class="bracket_wrapper winner_brackets first_round">
                      <div class="img_user">
                          <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                              class="logo" alt="">
                      </div>
                      <div class="name_wrapper">
                          Loading
                      </div>
                  </div>
                  <div class="bracket_wrapper looser_brackets first_round">
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

                  <div class="bracket_wrapper winner_brackets second_round">
                      <div class="img_user">
                          <img src="https://am-a.akamaihd.net/image?resize=72:72&amp;f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png"
                              class="logo" alt="">
                      </div>
                      <div class="name_wrapper">
                          Loading
                      </div>
                  </div>
                  <div class="bracket_wrapper looser_brackets second_round">
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

    document.getElementById("joinButton").addEventListener("click", () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            command: "join",
            player_id: this.userId, // Use the predefined user ID
          })
        );
        document.getElementById("status").innerHTML = "Joining tournament...";
      } else {
        alert("WebSocket connection is not open. Please try again.");
      }
    });
  }
}

customElements.define("tournament-page", Tournament);
