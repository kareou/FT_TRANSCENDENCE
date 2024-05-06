export default class Chat extends HTMLElement {
  constructor() {
    super();
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
            <div class="chat_wrapper_">
                <div class="first_section_wrapper_chat">
                    <div class="first_profile_wrapper_chat">
                        <div class="pdp_warpper">
                            <img src="assets/pdp.png" alt="profile picture" class="pfp_logo">
                        <div class="txt_one">Chats</div>

                        </div>
                        <div class="icon_wrapper_">
                            <img src="assets/Group 33.png" alt="grp33" class="grp_33">
                        </div>
                    </div>
                    <div class="chat_bulles_wrapper_">
                        <div class="chat_bulle_wrapper">
                            <div class="chat_pdp_wrapper">
                                <img src="assets/Ellipse 20.png" alt="ellipse 20"
                                    class="pdp_logo_chat">
                            </div>
                            <div class="data_chat_bulle_wrapper">
                                <div class="name_bulle_chat">
                                    Hassan
                                </div>
                                <div class="content_bulle_chat">
                                    Good
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat_bulles_wrapper_">
                        <div class="chat_bulle_wrapper">
                            <div class="chat_pdp_wrapper">
                                <img src="assets/Ellipse 20.png" alt="ellipse 20"
                                    class="pdp_logo_chat">
                            </div>
                            <div class="data_chat_bulle_wrapper">
                                <div class="name_bulle_chat">
                                    Hassan
                                </div>
                                <div class="content_bulle_chat">
                                    Good
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat_bulles_wrapper_ last_chat">
                        <div class="chat_bulle_wrapper">
                            <div class="chat_pdp_wrapper">
                                <img src="assets/Ellipse 20.png" alt="ellipse 20"
                                    class="pdp_logo_chat">
                            </div>
                            <div class="data_chat_bulle_wrapper">
                                <div class="name_bulle_chat">
                                    Hassan
                                </div>
                                <div class="content_bulle_chat">
                                    Good
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>>
        `;
  }
}

customElements.define("chat-page", Chat);
