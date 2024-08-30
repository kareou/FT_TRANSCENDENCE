import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class Notification extends HTMLElement {
  constructor() {
    super();
    Http.website_stats.addObserver({
      update: () => this.update(),
      event: "notification",
      data: this.matchmakingstate,
    });
  }
  connectedCallback() {
    this.render();
  }

  update() {
    document
      .querySelector(".notification_wrapper")
      .classList.add("notification_alert");
    this.render();
  }

  async getNotification() {
    const data = await Http.getData("GET", "api/notification/");
    console.log(data);
    const notificationContainer = this.querySelector(".notification_container");
    notificationContainer.innerHTML = "";
    const dropdown = document.querySelector(".notification_dropdown");
    if (data.length > 0) {
      data.forEach((notification) => {
        const notificationDiv = document.createElement("div");
        notificationDiv.classList.add("notification");
        notificationDiv.innerHTML = `
                    <div class="notification_content">
                        <img src="${ips.baseUrl}${notification.sender.profile_pic}" alt="profile" class="notification_user_image" loading="lazy">
                        <div>
                        <h2>${notification.sender.username}</h2>
                        <p>
                            has sent you a ${notification.type}
                        </p>
                        </div>
                        <button class="notification_action">
                            <i class="fa-solid fa-turn-right"></i>
                        </button>
                    </div>
                `;
        notificationContainer.appendChild(notificationDiv);
      });
    } else {
      const notificationDiv = document.createElement("div");
      notificationDiv.classList.add("notification");
      notificationDiv.innerHTML = `
                <div class="notification_content">
                    <h2>No Notifications</h2>
                </div>
            `;
      // notificationContainer.addEventListener("animationend", () => {
      notificationContainer.appendChild(notificationDiv);
      // });
    }
  }

  async markAllRead() {
    const response = await fetch(
      `${ips.baseUrl}/api/notification/mark_all_read/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      this.render();
    }
  }

  render() {
    this.innerHTML = `
            <div style="position: relative;">
                <button class="notification_wrapper">
                <i class="fa-light fa-bell fa-2xl notification_icon" style="color: white;"></i>
                </button>
                <div class="notification_dropdown ">
                    <h1>Notifications</h1>
                    <div class="notification_container">
                    </div>
                </div>
            </div>
            `;
    const notification = this.querySelector(".notification_wrapper");
    notification.addEventListener("click", () => {
      document
        .querySelector(".notification_wrapper")
        .classList.remove("notification_alert");
      document.querySelector(".notification_dropdown").classList.toggle("show");
      document.querySelector(".notification_dropdown").style.top = "3.5rem";
      document.querySelector(".notification_dropdown").style.right = "-1rem";
      document.querySelector(".notification_dropdown").style.width = "20rem";
      document
        .querySelector(".notification_dropdown")
        .addEventListener("animationend", this.getNotification().bind(this));
    });
  }
}

customElements.define("notification-icon", Notification);
