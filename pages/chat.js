export default class Chat extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/`
        <div class="body_wrapper">
        <side-bar></side-bar>
        <div class="second_content_chat_wrapper">
        <div class="chat_notification_bar_wrapper">
            <div class="search_input_wrapper">
                <input type="text" name="search" id="search_chat" class="search_chat"
                    placeholder="Search Everything">
            </div>
            <div class="notification_wrapper">
                <img src="assets/notification.png" alt="notification logo" class="notification_icon">
            </div>
        </div>
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
                            <img src="assets/Ellipse 20.png" alt="ellipse 20" class="pdp_logo_chat">
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
                            <img src="assets/Ellipse 20.png" alt="ellipse 20" class="pdp_logo_chat">
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
                            <img src="assets/Ellipse 20.png" alt="ellipse 20" class="pdp_logo_chat">
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
            <div class="second_section_wrapper_chat">
                <div class="con_infos_wrapper_">
                    <div class="wrapper_first_con_second_section">
                        <div class="first_wrapper_info_user_chat_wrapper">
                            <div class="first_side_wrapper_con_chat__">
                                <img src="assets/pdp.png" alt="logo_user" class="logo_chat_user">
                                <div class="infos_con_user_wrapper">
                                    <h3 class="name_user_con">
                                        Othmane
                                    </h3>
                                    <p class="status_user_con">
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div class="second_side_wrapper_con_chat__">
                                <img src="assets/info_icon.png" alt="info logo" class="info_logo_">
                            </div>
                        </div>
                    </div>
                    <div class="chat_container_conv__">
                        <div class="conv_data_container_chat__">
                            <div class="slots_messages_container__">
                                <div class="slot_message_container___">
                                    <div class="message_container__ first_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Hello
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message_container__ second_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Hello
                                            </div>
                                        </div>
                                    </div>

                                    <div class="message_container__ first_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                How are you ?
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message_container__ second_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Good, What about you ?
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message_container__ second_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Good, What about you ?
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message_container__ second_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Good, What about you ?
                                            </div>
                                        </div>
                                    </div>
                                    <div class="message_container__ second_msg_user">
                                        <div class="message_user_container__">
                                            <div class="message_user_content__">
                                                Good, What about you ?
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div class="input_conv_container__chat">
                            <input type="text" class="send_msg_input" placeholder="Aa">
                        </div>
                    </div>
                </div>
            </div>
            <div class="third_section_wrapper_chat">
                <div class="infos_container_third_sec_chat">
                    <div class="img_pdp_third_container_wrapper">
                        <img src="assets/pdp.png" alt="profile picture" class="pdp_img_a">
                    </div>
                    <div class="details_container_third_wrapper">
                        <h2 class="name_container_third_wrapper_ white">
                            Othmane
                        </h2>
                        <div class="status_third_wrapper_ gray">
                            Online
                        </div>
                    </div>
                </div>
                <div class="shared_files_wrapper__third_sec_">
                    <div class="tile_dropdown_wrapper__third">
                        <div class="title_con___ white">
                            Shared Files
                        </div>
                        <div class="dropdown_con___">
                            <img src="assets/drop_icon_arrow.png" alt="grp33" class="drop_down_icon">
                        </div>
                    </div>
                </div>
                <div class="shared_files_wrapper__third_sec_">
                    <div class="tile_dropdown_wrapper__third">
                        <div class="title_con___ white">
                            Shared Files
                        </div>
                        <div class="dropdown_con___">
                            <img src="assets/drop_icon_arrow.png" alt="grp33" class="drop_down_icon">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        </div>
    </div>
        `;
  }
}

customElements.define("chat-page", Chat);
