import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class FriendData extends HTMLElement {
  constructor() {
    super();
    this.id = this.getAttribute("id");
    this.profile_pic = this.getAttribute("profile_pic");
    this.full_name = this.getAttribute("full_name");
    this.friendship_id = this.getAttribute("friendship_id");
    this.state = this.getAttribute("state");
    this.matches = [];
  }
  connectedCallback() {
    this.render();
    this.querySelector(".remove_friend").addEventListener("click", () => {
      Http.getData("DELETE", `api/friends/${this.friendship_id}`).then(
        (response) => {
          Http.getData("GET", "api/friends/").then((data) => {
            console.log("Froends are => ", data);
          })
          delete Http.friends[this.id];
          Http.website_stats.notify("friends");
          Http.notification_socket.send(
            JSON.stringify({
              type: "remove_friend",
              message: this.friendship_id,
              receiver: this.id,
              sender: Http.user.id,
            })
          );
        }
      );
      console.log("remove friend");
      console.log(this.friendship_id);
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
    <div class="friend_wrapper__">
    <div class="user_data_wrapper" style="width: 100%;">
    <user-avatar image="${ips.baseUrl}${this.profile_pic}" state=${this.state} width="70" height="70"></user-avatar>
    <p class="user_name_wrapper">${this.full_name}</p>
    </div>
    <div class="icons_wrapper" style="display: flex;align-content: center;">
      <button class="send_msg no_style">
        <i class="fa-regular fa-message"></i>
      </button>
      <button class="remove_friend no_style">
        <i class="fa fa-ban" aria-hidden="true"></i>
      </button>
    </div>
  </div>
    `;
  }
}
customElements.define("friend-data", FriendData);
