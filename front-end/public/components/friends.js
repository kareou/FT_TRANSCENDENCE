import Http from "../http/http.js";

export default class Friends extends HTMLElement {
  constructor() {
    super();
    Http.website_stats.addObserver({
      update: this.update.bind(this),
      event: "friends",
    });
    Http.website_stats.addObserver({
      update: this.update.bind(this),
      event: "remove_friend",
    });
    Http.website_stats.addObserver({
      update: this.update.bind(this),
      event: "status_update",
    });
  }

  update() {
    this.render();
    this.getFriends();
  }

  getFriends() {
    const friends_wrapper = document.querySelector(".friend_online_wrapper");

    const online_friend = document.querySelector(".online_friend");
    // console.log("friends => :", Http.friends.length, Http.friends);
    if (Http.friends) {
        for (let i in Http.friends) {
        // console.log("friends => :", Http.friends[i]);
        let fr;
        fr = `<friend-data id="${Http.friends[i].id}" state=${Http.friends[i].online} profile_pic="${Http.friends[i].profile_pic}"  full_name="${Http.friends[i].full_name}" friendship_id="${Http.friends[i].friendship_id}" style="width:100%"></friend-data>`;
        friends_wrapper.innerHTML += fr;
      }
    } else if (Http.friends.length === 0) {
      online_friend.style.overflow = "hidden";
      friends_wrapper.innerHTML = `
                        <img src="/public/assets/lonely-96.png" alt="empty" style="width: 96px;height: 96px;" lazy="loading">
      <h1>you don't have any friends yet</h1>
      `;
      friends_wrapper.classList.add("center_toggle");
    }
  }

  connectedCallback() {
    this.render();
    this.getFriends();
  }

  render() {
    this.innerHTML = /*HTML*/ `
            <div class="online_friend" style="display: flex;flex-direction: column;padding: 15px 0;">
            <h1>Friends</h1>
            <div class="friend_online_wrapper" style="width: 100%;">
            </div>
        </div>
        `;
  }
}

customElements.define("c-friends", Friends);
