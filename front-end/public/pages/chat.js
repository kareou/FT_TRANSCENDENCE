import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class Chat extends HTMLElement {
  constructor() {
    super();
    this.user = Http.user;
    this.token = localStorage.getItem("token");
    this.receiverId = null;
    this.conversationId = null;
    this.chatContainer = null;
    this.conversations = [];
  }

  connectedCallback() {
    this.render();
    this.fetchUsers();
    this.setupEventListeners();
  }
  isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${month}/${day}/${year}`;
  }

  escapeHTML(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  setupWebSocket() {
    this.conversations.forEach((conversation) => {
      conversation.websocket.addEventListener("open", function (event) {
        console.log(
          "WebSocket connection opened with sender " +
          conversation.senderId +
          " and reciever : " +
          conversation.receiverId
        );
      });

      conversation.websocket.onmessage = this.handleWebSocketMessage.bind(this);

      conversation.websocket.addEventListener("close", function (event) {
        console.log("WebSocket connection closed.");
      });
    });
  }
  handleWebSocketMessage(event) {
    const message = JSON.parse(event.data);

    if (message.type == "message") this.displayNewMessage(message);
    else if (message.type == "block_notification") {
      const userElements = this.querySelectorAll(".chat_bulles_wrapper");
      userElements.forEach((userElement) => {
        if (
          userElement.id == message.blocker ||
          userElement.id == message.blocked
        ) {
          userElement.click();
        }
      });
    }
  }

  async fetchUsers() {
    try {
      const response = await fetch(`${ips.baseUrl}/chat/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const users = await response.json();
        this.displayUsers(users);
      } else {
        console.error("Error fetching users:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  displayUsers(users) {
    const userContainer = this.querySelector(".first_section_wrapper_chat");
    userContainer.innerHTML = `
        <div class="first_profile_wrapper_chat">
            <div class="pdp_warpper">
                <img src="${ips.baseUrl}${this.user.profile_pic}" class="pfp_logo" alt="profile picture" loading="lazy">
                </div>
            <div class="icon_wrapper_">
            </div>
        </div>
        `;

    users.forEach((user) => {
      const userElementHTML = /* HTML */ `
        <div
          class="chat_bulles_wrapper user"
          id="${user.id}"
          name="${user.username}"
        >
          <div class="chat_bulle_wrapper">
            <div class="chat_pdp_wrapper" style="position: relative;">
              <user-avatar
                image="${user.profile_pic}"
                state="online"
                width="50"
                height="50"
              ></user-avatar>
            </div>
            <div class="data_chat_bulle_wrapper">
              <div class="name_bulle_chat">${user.username}</div>
              <div class="last_msg"></div>
            </div>
          </div>
        </div>
      `;

      userContainer.innerHTML += userElementHTML;
    });

    this.addUserClickListeners();
  }

  addUserClickListeners() {
    const userElements = this.querySelectorAll(".chat_bulles_wrapper");

    userElements.forEach((userElement) => {
      const receiverId = userElement.id;
      const senderId = this.user.id;
      const websocket = new WebSocket(
        `${ips.socketUrl}/ws/chat/${senderId}/${receiverId}/`
      );
      const newConversation = { senderId, receiverId, websocket };
      this.conversations.push(newConversation);

      userElement.addEventListener("click", () => {
        this.receiverId = receiverId;
        this.querySelector(".blocked-user-message").style.display = "none";
        this.querySelector(".input_conv_container__chat").style.display =
          "flex";

        this.fetchOrCreateConversation(senderId, receiverId).then(
          (conversation) => {
            if (conversation.id != this.conversationId) {
              this.conversationId = conversation.id;
              console.log("conversation : " + conversation.conversation);
              console.log("conversation id : " + conversation.id);
              this.fetchMessagesForConversation(conversation.id);
              const username = userElement.getAttribute("name");
              this.querySelector(".infos_con_user_wrapper").setAttribute(
                "href",
                `/dashboard/profile/${username}`
              );
              this.querySelector(".name_user_con").innerHTML =
                userElement.getAttribute("name");
              this.querySelector(".logo_chat_user").src =
                userElement.querySelector(".avatar_icon").src;
              this.querySelector(".name_user_con").innerHTML =
                userElement.getAttribute("name");
              this.querySelector(".find_conv").style.display = "none";
              this.querySelector(".second_section_wrapper_chat").style.display =
                "block";
              this.querySelector(".third_section_wrapper_chat").style.display =
                "block";
            }
          }
        );
      });
    });
    this.setupWebSocket();
  }
  caseBlock() {
    this.querySelector(".blocked-user-message").style.display = "block";
    this.querySelector(".input_conv_container__chat").style.display = "none";
  }

  async fetchOrCreateConversation(senderId, receiverId) {
    try {
      const response = await fetch(
        `${ips.baseUrl}/chat/conversations/fetch_or_create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            sender: senderId,
            receiver: receiverId,
          }),
        }
      );

      const responseData = await response.json();
      this.querySelector(".block-btn").classList.remove("hidden");
      switch (responseData.case) {
        case "missing_data":
          console.error("Missing sender or receiver");
          break;
        case "user_not_found":
          console.error("One of the users does not exist");
          break;
        case "sender_blocked_receiver":
          this.querySelector(".block-message").innerHTML =
            "You have blocked this user and cannot send messages.";
          console.error("You have blocked this user");
          this.caseBlock();
          this.toggleBlockButton("unblock");
          break;
        case "receiver_blocked_sender":
          this.querySelector(".block-message").innerHTML =
            "You are blocked by this user and cannot send messages.";
          console.error("You are blocked by this user");
          this.caseBlock();
          this.querySelector(".block-btn").classList.add("hidden");
          this.toggleBlockButton("block");
          break;
        case "conversation_created":
          console.log("Conversation created:", responseData.conversation);
          this.toggleBlockButton("block");
          break;
        case "conversation_fetched":
          console.log("Fetched conversation:", responseData.conversation);
          this.toggleBlockButton("block");
          break;
        default:
          console.error("Unknown case:", responseData.case);
      }

      return responseData.conversation;
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async fetchOrCreateConversationAndVerifyBlock(senderId, receiverId) {
    try {
      const response = await fetch(
        `${ips.baseUrl}/chat/conversations/fetch_or_create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            sender: senderId,
            receiver: receiverId,
          }),
        }
      );

      const responseData = await response.json();

      switch (responseData.case) {
        case "missing_data":
          return 0;
        case "user_not_found":
          return 0;
        case "sender_blocked_receiver":
          return 0;
        case "receiver_blocked_sender":
          return 0;
        case "conversation_created":
          return 1;
        case "conversation_fetched":
          return 1;
      }
      return 1;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async fetchMessagesForConversation(conversationId) {
    try {
      const response = await fetch(
        `${ips.baseUrl}/chat/messages/fetch_messages/?conversation_id=${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const messages = await response.json();
        this.displayMessages(messages);
      } else {
        const errorData = await response.json();
        console.error(
          "Error fetching messages:",
          errorData.detail || response.statusText
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  displayNewMessage(data) {
    let messageHTML = "";
    const message_time = this.isToday(data.timestamp)
      ? this.formatTime(data.timestamp)
      : this.formatDate(data.timestamp);
    if (data.sender != this.user.id) {
      messageHTML = `
            <div class="slot_message_container___ ">
            <div class="message_container__ second_msg_user ">
                <div class='content_time_msg'>
                    <div class="message_user_container__ right_side_msg">
                        <div class="message_user_content__">
                            ${data.message}
                        </div>
                    </div>
                    <div class='msg_time'>
                        ${message_time}
                    </div >
                </div>
                <img src="${this.querySelector(".logo_chat_user").src
        }" class="user_pic_msg_right" alt="profile picture" loading="lazy">
            </div>
        </div>
    `;
    } else {
      messageHTML = `
            <div class="slot_message_container___">
            <div class="message_container__ first_msg_user">
            <img src="${ips.baseUrl}${this.user.profile_pic}" class="user_pic_msg_left" alt="profile picture" loading="lazy">
                    <div class="message_user_container__">
                        <div class='content_time_msg'>
                            <div class="message_user_content__">
                                ${data.message}
                            </div>
                        </div>
                        <div class='msg_time'>
                        ${message_time}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    const userElements = this.querySelectorAll(".chat_bulles_wrapper");
    userElements.forEach((userElement) => {
      if (userElement.getAttribute("id") == data.sender) {
        userElement.querySelector(".last_msg").innerHTML = data.message;
      }
    });

    this.chatContainer.innerHTML += messageHTML;
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  displayMessages(messages) {
    this.chatContainer = this.querySelector(".slots_messages_container__");
    this.chatContainer.innerHTML = "";
    messages.forEach((message) => {
      const message_time = this.isToday(message.timestamp)
        ? this.formatTime(message.timestamp)
        : this.formatDate(message.timestamp);

      let messageHTML = "";
      if (message == messages[messages.length - 1]) {
        const userElements = this.querySelectorAll(".chat_bulles_wrapper");

        userElements.forEach((userElement) => {
          if (
            userElement.getAttribute("id") == this.receiverId ||
            userElement.getAttribute("id") == message.sender
          )
            userElement.querySelector(".last_msg").innerHTML =
              messages[messages.length - 1].message;
        });
      }

      if (message.sender != this.user.id) {
        messageHTML = `
                    <div class="slot_message_container___ ">
                        <div class="message_container__ second_msg_user ">
                            <div class='content_time_msg'>
                                <div class="message_user_container__ right_side_msg">
                                    <div class="message_user_content__">
                                        ${message.message}
                                    </div>
                                </div>
                                <div class='msg_time'>
                                    ${message_time}
                                </div >
                            </div>
                            <img src="${this.querySelector(".logo_chat_user").src
          }" class="user_pic_msg_right" alt="profile picture" loading="lazy">
                        </div>
                    </div>
                `;
      } else {
        messageHTML = `
                    <div class="slot_message_container___">
                    <div class="message_container__ first_msg_user">
                    <img src="${ips.baseUrl}${this.user.profile_pic}" class="user_pic_msg_left" alt="profile picture" loading="lazy">
                            <div class="message_user_container__">
                                <div class='content_time_msg'>
                                    <div class="message_user_content__">
                                        ${message.message}
                                    </div>
                                </div>
                                <div class='msg_time'>
                                ${message_time}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      }

      this.chatContainer.innerHTML += messageHTML;

    });
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  displayMessage(message) {
    if (
      message.sender === this.receiverId ||
      message.receiver === this.receiverId
    ) {
      this.displayMessages([message]);
    }
  }

  async sendMessage() {
    if (!this.receiverId) {
      console.error("No receiver selected");
      this.clearChatArea();
      return;
    }

    const messageContent = this.escapeHTML(
      document.querySelector(".message-input").value
    );
    if (messageContent.trim().length != 0) {
      const messageData = {
        sender: this.user.id,
        message: messageContent,
        timestamp: new Date().toISOString(),
        conversation: this.conversationId,
      };

      const checkConversation =
        await this.fetchOrCreateConversationAndVerifyBlock(
          this.user.id,
          this.receiverId
        );

      if (checkConversation === 0) {
        console.log(
          "Action aborted: User is blocked or conversation could not be created."
        );
        return;
      }
      try {
        const response = await fetch(`${ips.baseUrl}/chat/messages/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          credentials: "include",
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Message saved via api:", data);
          const dataWs = {
            type: "message",
            message: data.message,
            sender: data.sender,
            timestamp: data.timestamp,
          };
          this.conversations.forEach((conversation) => {
            if (
              conversation.senderId == this.user.id &&
              conversation.receiverId == this.receiverId
            ) {
              conversation.websocket.send(JSON.stringify(dataWs));
              console.log(
                "sender : ",
                this.user.id,
                " receiver : ",
                this.receiverId
              );
              document.querySelector(".message-input").value = "";
            }
          });
        } else {
          const errorData = await response.json();
          console.error(
            "Error saving message:",
            errorData.detail || response.statusText
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  clearChatArea() {
    this.querySelector(".second_section_wrapper_chat").innerHTML = "";
    this.querySelector(".second_section_wrapper_chat").style.display = "none";
  }
  async blockOrUnblockUser() {
    try {
      let apiUrl = `${ips.baseUrl}/api/friends/block/`;
      if (this.querySelector(".block-btn").innerHTML == "unblock")
        apiUrl = `${ips.baseUrl}/api/friends/unblock/`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ user1: this.user.id, user2: this.receiverId }),
      });

      if (response.ok) {
        this.conversations.forEach((conversation) => {
          if (
            conversation.senderId == this.user.id &&
            conversation.receiverId == this.receiverId
          ) {
            const dataWs = {
              type: "block_notification",
              sender: this.user.id,
              blocker: this.user.id,
              blocked: this.receiverId,
            };
            conversation.websocket.send(JSON.stringify(dataWs));
          }
        });
      } else {
        console.error("error block");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  clearChatArea() {
    this.querySelector(".second_section_wrapper_chat").innerHTML = "";
    this.querySelector(".second_section_wrapper_chat").style.display = "none";
  }

  setupEventListeners() {
    const sendButton = this.querySelector(".send-button");
    const sendInput = document.querySelector(".message-input");
    document
      .querySelector(".message-input")
      .addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          sendButton.click();
        }
      });
    sendButton.addEventListener("click", () => {
      this.sendMessage();
    });

    const blockButton = this.querySelector(".block-btn");

    blockButton.addEventListener("click", () => {
      this.blockOrUnblockUser();
    });

    const find_friends = document.querySelector(".find_friends");
    const modal_wrapper_chat = document.querySelector(".modal_wrapper_chat");
    find_friends.addEventListener("click", () => {
      modal_wrapper_chat.style.display = "block";
    });
    

    const colseButton = document.querySelector("#close-btn");
    colseButton.addEventListener("click", () => {
      modal_wrapper_chat.style.display = "none";
    });

    const overlay = document.querySelector(".overlay_chat");

    modal_wrapper_chat.addEventListener("click", function (event) {
      console.log(event.target);
      console.log(overlay);
      if (event.target === overlay) {
        modal_wrapper_chat.style.display = "none";
      }
    });

    const user_list_wrapper = document.querySelector(
      ".users_search_list_wrapper"
    );

    document.querySelector(".search").addEventListener("input", (e) => {
      Http.getData("GET", "api/friends").then((data) => {

        console.log(data)
        if (e.target.value === "") {
          user_list_wrapper.innerHTML = "";
        } else {
          for (let i = 0; i < data.length; i++) {
            if (data[i].user1.id === Http.user.id) {
              console.log(e.target.value);
              console.log(data[i].user2.username);
              if (data[i].user2.username.includes(e.target.value)) {
                user_list_wrapper.innerHTML += `
                <div class="user_wrapper_search">
                <a is="co-link" href="/dashboard/profile/${data[i].user2.username}" style="
    display: flex;
">

                <img src="${ips.baseUrl}${data[i].user2.profile_pic}" alt="" width="30" height="30" class="user_img_search">
                <div class="fullname_search">${data[i].user2.full_name}</div>
                </a>
              </div>`;
              }
            } else {
              console.log(e.target.value);
              console.log(data[i].user2.username);
              if (data[i].user1.username.includes(e.target.value)) {
                user_list_wrapper.innerHTML += `
                <div class="user_wrapper_search">
                <a is="co-link" href="/dashboard/profile/${data[i].user1.username}" style="
    display: flex;
">
                <img src="${ips.baseUrl}${data[i].user1.profile_pic}" alt="" width="30" height="30" class="user_img_search">
                <div class="fullname_search">${data[i].user1.full_name}</div>
                </a>
              </div>`;
              }
            }
          }
        }
      });
    });
  }
  toggleBlockButton(state) {
    if (state == "block") this.querySelector(".block-btn").innerHTML = "block";
    else if (state == "unblock")
      this.querySelector(".block-btn").innerHTML = "unblock";
  }
  render() {
    this.innerHTML = /* HTML */ `

        <div class="chat_wrapper_">
        <div class="modal_wrapper_chat">
          <div class="overlay_chat"></div>
            <div class="modal_content_wrapper">
                <div class="search_input_wrapper_" style="display:flex;">
                  <input type="text" name="search" id="search" class="search" placeholder="What are you looking for ?">

                  <i class="fa-regular fa-circle-xmark fa-2x" id="close-btn" style="margin-left:10px; padding:5px; color: red;" ></i>

                </div>
                <div class="users_search_list_wrapper">

                </div>
            </div>
          </div>
            <div class="first_section_wrapper_chat">

            </div>
            <div class="find_conv">
                     <i class="fa-duotone fa-solid fa-comments"></i>

                    <h1>select a conversation to start chatting</h1>
                    <p>or find a friend and chat</p>
                    <button class="find_friends"><span class="find_friends_span">Find Friends <i class="fa-light fa-user-group"></span></i> </button>
            </div>
            <div class="second_section_wrapper_chat">
                  <div class="wrapper_first_con_second_section">
                  <div class="first_wrapper_info_user_chat_wrapper">
                      <div class="first_side_wrapper_con_chat__">
                          <img src="../assets/pdp.png" alt="logo_user" class="logo_chat_user">
                          <a class="infos_con_user_wrapper" style="cursor:pointer">
                              <h3  class="name_user_con" id="username">

                              </h3>

                          </a>
                      </div>
                      <div class="second_side_wrapper_con_chat__">
                          <button class='play_invite'>
                          <i class="fa-solid fa-gamepad-modern fa-2xl"></i>
                          </button>
                          <button class="block-btn" style="background: none;border: none;">
                          <span class="block-state">block</span>
                       </button>
                      </div>
                  </div>
          </div>
                <div class="chat_container_conv__">
                        <div class="conv_data_container_chat__">
                            <div class="slots_messages_container__">

                            </div>
                        </div>
                        <div style="display: flex; justify-content: center; width: 100%;">
                            <div id="blocked-user-message" class="blocked-user-message">
                                <p class="block-message"></p>
                            </div>
                            <div class="input_conv_container__chat">
                                <textarea name="" id="" class="send_msg_input message-input" rows="1" placeholder="Message"></textarea>
                                <button class="send-button">
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                </div>
            </div>

        </div>
    `;

    this.chatContainer = this.querySelector(".slots_messages_container__");
    this.userContainer = this.querySelector(".first_section_wrapper_chat");
    const textArea = this.querySelector(".send_msg_input");
    textArea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
    this.querySelector(".second_section_wrapper_chat").style.display = "none";
  }
}

customElements.define("chat-page", Chat);
