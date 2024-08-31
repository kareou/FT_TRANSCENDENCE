import MatchData from "./match_data.js";
import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class FriendRequest extends HTMLElement {
  constructor() {
    super();
    this.id = this.getAttribute("id");
    this.profile_pic = this.getAttribute("profile_pic");
    this.full_name = this.getAttribute("full_name");
    this.user_id = this.getAttribute("user_id");
    this.matches = [];
  }

  connectedCallback() {
    this.render();
    this.querySelector(".accept").addEventListener("click", () => {
      console.log("accept");
      Http.getData("POST", `api/friends/accept/`).then((response) => {
        Http.website_stats.notify("friends");
      });
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
            <div class="friend_wrapper__">
            <div class="user_data_wrapper" style="width: 100%;">
            <img src="${ips.baseUrl}${this.profile_pic}" alt="medal" class="user_img_rounded">
            <p class="user_name_wrapper">${this.full_name}</p>
            </div>
            <div class="icons_wrapper" style="display: flex;align-content: center;">
            <button class="accept no_style">
            <i class="fa fa-check" aria-hidden="true"></i>
        </button>
        <button class="decline no_style">
        <i class="fa fa-ban" aria-hidden="true"></i>
        </button>
            </div>
        </div>
    `;
  }
}
customElements.define("friend-request", FriendRequest);
