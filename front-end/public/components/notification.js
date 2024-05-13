export default class TopBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (window.location.pathname === "/signin" || window.location.pathname === "/signup" || window.location.pathname === "/")
      return;
    this.innerHTML = /*HTML*/ `
        <div class="chat_notification_bar_wrapper">
                <div class="search_input_wrapper">
                    <input type="text" name="search" id="search_chat" class="search_chat"
                        placeholder="Search Everything">
                </div>
                <div class="notification_wrapper">
                    <img src="/public/assets/notification.png" alt="notification logo" class="notification_icon">
                </div>
            </div>
        `;
  }
}

customElements.define("top-bar", TopBar);
