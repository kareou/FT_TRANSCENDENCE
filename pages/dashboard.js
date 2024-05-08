export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    document.title = "dashboard";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
            <div class="body_wrapper">
                <side-bar></side-bar>
                <div class="second_content_chat_wrapper">
                    <top-bar></top-bar>
                    <div class="dashboard_wrapper">
                        <div class="profile_n_rank">
                            <div class="profile">
                                <div class="profile_img">
                                <img src="assets/test.jpg" alt="profile">
                                </div>
                                <div class="profile_info">
                                    <div class="profile_name" id="user_name">Name</div>
                                    <div class="profile_rank" id="login">Rank</div>
                                </div>
                            </div>
                            <div class="rank">
                                <div class="first">
                                <img src="assets/medal.png" alt="medal">
                                <h1>iness joumaa</h1>
                                </div>
                                <div class="second">
                                <h1>Friends</h1>
                                </div>
                                <div class="third">
                                <h1>Friends</h1>
                                </div>
                            </div>
                        </div>
                        <div class="game_n_friends">
                            <div class="game">
                            <h1>Actual Game</h1>
                            <div class="game_wrapper">
                              <video class="game_video" src="assets/pong_animation.mp4" autoplay loop></video>
                              <button class="game_button">Play Now</button>    
                            </div>
                            </div>
                            <div class="friends">
                            <h1>Online Friends</h1>
                            <div class="online_friend">
                              <h1>Friends</h1>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
`;
  }
}

customElements.define("dashboard-page", Dashboard);
