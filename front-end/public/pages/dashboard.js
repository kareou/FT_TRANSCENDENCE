import Http from "../http/http.js";

export default class Dashboard extends HTMLElement {
constructor() {
super();
document.title = "dashboard";
this.user = Http.user;
}

connectedCallback() {
this.render();
}

render() {
this.innerHTML = /*HTML*/ `
<style>
  .user_img_rounded {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .friend_online_wrapper {
    display: flex;
    align-items: center;
  }

  .user_img_rounded {
    width: 70px;
    height: 70px;
    margin: 0px 15px;

  }

  .user_name_wrapper {
    color: white;
  }

  .friend_online_wrapper {
    display: flex;
    flex-direction: column;
    padding: 15px 0;
  }

  .no_style {
    background: none;
    border: none;
    padding: 0 15px;
  }

  .no_style:hover {
    color: #04BF8A;
  }

  .user_data_wrapper {
    display: flex;
    align-items: center;
  }

  .friend_wrapper__{
    display: flex;
    width: 100%;
    padding: 15px 0;
  }
  .online_friend{
    overflow-y: scroll;
  }

    /* For Chrome, Safari and Opera */
    .online_friend::-webkit-scrollbar {
      width: 5px; /* Change this to modify scroll size */
    }
  
    .online_friend::-webkit-scrollbar-track {
      background: #0C1222; /* Change this to modify track color */
    }
  
    .online_friend::-webkit-scrollbar-thumb {
      background: #16738d; /* Change this to modify scroll color */
    }
  
    .online_friend::-webkit-scrollbar-thumb:hover {
      background: #16738d; /* Change this to modify scroll color */
    }
  
    /* For IE and Edge */
    .online_friend {
      scrollbar-width: thin; /* Change this to modify scroll size */
      scrollbar-color: #0C1222 #959595; /* Change this to modify scroll and track color */
    }
</style>
<div class="dashboard_wrapper">
  <profile-info id="${this.user.username}"></profile-info>
  <div class="rank">
    <div class="first">
      <img src="/public/assets/medal.png" alt="medal">
      <h1>iness joumaa</h1>
    </div>
    <div class="second">
      <h1>Friends</h1>
    </div>
    <div class="third">
      <h1>Friends</h1>
    </div>
  </div>
  <div class="game_wrapper">
    <a is="co-link" href="/dashboard/game/local/1v1" class="game_button" id="local">Play Local</a>
    <a is="co-link" href="/dashboard/game/online/1v1" class="game_button" id="online">Play Online</a>
  </div>
  <div class="online_friend">
    <h1>Friends</h1>
    <div class="friend_online_wrapper" style="width: 100%;">
      <div class="friend_wrapper__">
        <div class="user_data_wrapper" style="width: 100%;">
          <img src="http://localhost:8000${this.user.profile_pic}" alt="medal" class="user_img_rounded">
          <p class="user_name_wrapper">${this.user.full_name}</p>
        </div>
        <div class="icons_wrapper" style="display: flex;align-content: center;">
          <button class="send_msg no_style">
            <i class="fa-regular fa-message"></i>
          </button>
          <button class="add_friend no_style">
            <i class="fa fa-user-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="friend_wrapper__">
        <div class="user_data_wrapper" style="width: 100%;">
          <img src="http://localhost:8000${this.user.profile_pic}" alt="medal" class="user_img_rounded">
          <p class="user_name_wrapper">${this.user.full_name}</p>
        </div>
        <div class="icons_wrapper" style="display: flex;align-content: center;">
          <button class="send_msg no_style">
            <i class="fa-regular fa-message"></i>
          </button>
          <button class="add_friend no_style">
            <i class="fa fa-user-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="friend_wrapper__">
        <div class="user_data_wrapper" style="width: 100%;">
          <img src="http://localhost:8000${this.user.profile_pic}" alt="medal" class="user_img_rounded">
          <p class="user_name_wrapper">${this.user.full_name}</p>
        </div>
        <div class="icons_wrapper" style="display: flex;align-content: center;">
          <button class="send_msg no_style">
            <i class="fa-regular fa-message"></i>
          </button>
          <button class="add_friend no_style">
            <i class="fa fa-user-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="friend_wrapper__">
        <div class="user_data_wrapper" style="width: 100%;">
          <img src="http://localhost:8000${this.user.profile_pic}" alt="medal" class="user_img_rounded">
          <p class="user_name_wrapper">${this.user.full_name}</p>
        </div>
        <div class="icons_wrapper" style="display: flex;align-content: center;">
          <button class="send_msg no_style">
            <i class="fa-regular fa-message"></i>
          </button>
          <button class="add_friend no_style">
            <i class="fa fa-user-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>

  </div>
</div>
`;
}
}

customElements.define("dashboard-page", Dashboard);