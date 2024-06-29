import Http from "../http/http.js";

export default class ProfileInfo extends HTMLElement {
  constructor() {
    super();
    this.user = Http.user;
    this.id = this.getAttribute("id");
  }
  connectedCallback() {
    if (this.id != this.user.id) {
      Http.getData("Get",`ft_auth/user/${this.id}`).then((data) => {
        this.user = data;
        this.render();
        this.markUnearnedAchievements();
      });
    }
    else{
      this.render();
      this.markUnearnedAchievements();
    }
  }

  markUnearnedAchievements() {
    const achievements = document.querySelectorAll(".achievement_list img");
    for (let i = 0; i < this.user.level; i++) {
      achievements[i].classList.add("earned");
    }
  }

  render() {
    this.innerHTML = /*HTML*/ `
        <div class="profile" >
      <div class="profile_img">
        <img src='http://localhost:8000${this.user.profile_pic}' class="profile_img" alt="profile">
      </div>
      <div class="profile_info">
        <div class="name_n_login">
          <h1 id="user_name">${this.user.full_name}</h1>
          <h6 id="login">${this.user.username}</h6>
        </div>
        <h2>
          <span>
            <i class="fa-sharp fa-light fa-coins" style="color: #04BF8A;"></i>
          </span>
          <span id="user_coins">2300$
          </span>
        </h2>
        <div class="achievement">
          <h1>Achievements</h1>
          <div class="achievement_list">
          <img src="/public/assets/ranks/1.png" alt="medal">
          <img src="/public/assets/ranks/2.png" alt="medal">
          <img src="/public/assets/ranks/3.png" alt="medal">
          <img src="/public/assets/ranks/4.png" alt="medal">
          <img src="/public/assets/ranks/5.png" alt="medal">
          <img src="/public/assets/ranks/6.png" alt="medal">
          <img src="/public/assets/ranks/7.png" alt="medal">
          </div>
          <h4 class="level">
            <span>${this.user.level}</span>
            <span>${this.user.exp}%</span>
          </h4>
          <div class="level-bar">
            <span style="width: ${this.user.exp}%;"></span>
          </div>
        </div>
      </div>
    </div>
    `;
  }
}

customElements.define("profile-info", ProfileInfo);
