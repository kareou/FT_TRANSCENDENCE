export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    this.title = "dashboard";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        <div class="body_wrapper">
            <side-bar></side-bar>
            <div class="second_content_chat_wrapper">
                <top-bar></top-bar>
                <div class="dashboard_wrapper">
                <div class="profile_game_wraper">
                    <div class="profile_wrapper">
                        <div class="profile_image_wrapper">
                            <img src="assets/Ellipse 20.png" alt="profile image" class="profile_image">
                        </div>
                        <div class="profile_name">
                            <h2>John Doe</h2>
                        </div>
                    </div>
                    <div class="game_wrapper">
                    <video class="game_video" autoplay loop muted>
                    <source src="assets/pong_animation.mp4" type="video/mp4">
                    </video>
                        <button class="game_button">Play Game</button>
                    </div>
                </div>
                <div class="online_friend">

                </div>
                </div>
            </div>
        </div>
        `;
  }
}

customElements.define("dashboard-page", Dashboard);
