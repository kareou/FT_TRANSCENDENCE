import Http from "../http/http.js";

export default class Chat extends HTMLElement {
    constructor() {
        super();
        this.user = Http.user;
        this.token = localStorage.getItem('token');
        this.receiverId = null;
        this.conversationId = null;
        this.chatContainer = null;
        this.websocket = null;
    }

    connectedCallback() {
        this.render();
        this.fetchUsers();
        this.setupEventListeners();
        // this.setupWebSocket();
    }

    setupWebSocket() {
        this.websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${this.user.id}/${this.receiverId}/`);

        this.websocket.addEventListener("open", function (event) {
            console.log("WebSocket connection opened.");
        });

        this.websocket.onmessage = this.handleWebSocketMessage.bind(this);

        this.websocket.addEventListener("close", function (event) {
            console.log("WebSocket connection closed.");
        });
    }
    handleWebSocketMessage(event) {
        const message = JSON.parse(event.data);
        console.log(message.sender);
        console.log("ws got " + message.message);
        // console.log(this.receiverId);

        // if (message.sender == this.user.id)
            this.displayNewMessage(message);
        // this.fetchChatData(this.user.id, this.receiverId);
    }

    async fetchUsers() {
        try {
            const response = await fetch(`http://localhost:8000/chat/users/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
            });

            if (response.ok) {
                const users = await response.json();
                console.log('All users:', users);
                this.displayUsers(users);

            } else {
                console.error('Error fetching users:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayUsers(users) {
        const userContainer = this.querySelector('.first_section_wrapper_chat');
        userContainer.innerHTML = `<div class="first_profile_wrapper_chat">
        <div class="pdp_warpper">
        <img src="http://localhost:8000${this.user.profile_pic}" class="pfp_logo" alt="profile picture" loading="lazy">
        <div class="txt_one">Chats</div>

    </div>
    <div class="icon_wrapper_">
        <i class="fa-solid fa-circle-ellipsis fa-2xl" style="color: #ffffff;"></i>
    </div>
</div>`;

        users.forEach(user => {
            const userElementHTML = `
            <div class="chat_bulles_wrapper user" id="${user.id}" name="${user.username}">
            <div class="chat_bulle_wrapper">
                <div class="chat_pdp_wrapper" style="position: relative;">
                    <user-avatar image="${user.profile_pic}" state="online" width="70" height="70"></user-avatar>
                </div>
                <div class="data_chat_bulle_wrapper">
                    <div class="name_bulle_chat">${user.username}</div>
                </div>
            </div>
        </div>
            `;

            userContainer.innerHTML += userElementHTML;
        });

        this.addUserClickListeners();
    }

    addUserClickListeners() {
        const userElements = this.querySelectorAll('.chat_bulles_wrapper');

        userElements.forEach(userElement => {
            userElement.addEventListener('click', () => {
                this.querySelector('.blocked-user-message').style.display = 'none';
                this.querySelector('.input_conv_container__chat').style.display = 'flex';
                const receiverId = userElement.id;
                const senderId = this.user.id;
                this.receiverId = receiverId;
                this.querySelector('.play_invite').addEventListener('click', () => {
                    Http.notification_socket.send(JSON.stringify({
                        type: "game_invite",
                        sender: senderId,
                        receiver: receiverId,
                        message: "Hey, let's play a game!"
                    }));
                });
                // this.get_blocked();
                this.fetchOrCreateConversation(senderId, receiverId).then(conversation => {
                    // this.querySelector(".block_or_send_container").innerHTML = '';
                    // this.querySelector(".logo_chat_user").setAttribute("src", `http://localhost:8000${conversation.json().receiver.profile_pic}`);

                    this.conversationId = conversation.id; // Set the conversation ID attribute
                    console.log("conversation : " + conversation.conversation);
                    console.log("conversation id : " + conversation.id);
                    this.setupWebSocket();
                    this.fetchMessagesForConversation(conversation.id);
                    const username = userElement.getAttribute("name");
                    this.querySelector(".infos_con_user_wrapper").setAttribute("href", `/dashboard/profile/?user=${username}`);
                    this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
                    this.querySelector(".logo_chat_user").src =
                    userElement.querySelector(".avatar_icon").src;
                  this.querySelector(".name_user_con").innerHTML =
                    userElement.getAttribute("name");
                  this.querySelector(".pdp_img_a").src =
                    userElement.querySelector(".avatar_icon").src;
                  this.querySelector(".name_container_third_wrapper_").innerHTML =
                    userElement.getAttribute("name");
                  this.querySelector(".find_conv").style.display = "none";
                  this.querySelector(".second_section_wrapper_chat").style.display =
                    "block";
                  this.querySelector(".third_section_wrapper_chat").style.display =
                    "block";
                    // this.querySelector('.blocked-user-message').style.display = 'none';
                    // this.querySelector('.input_conv_container__chat').style.display = 'block';
                });
            });
        });
    }
    caseBlock()
    {

        this.querySelector('.blocked-user-message').style.display = 'block';
        this.querySelector('.input_conv_container__chat').style.display = 'none';
    }

    async fetchOrCreateConversation(senderId, receiverId) {
        try {
            const response = await fetch(`http://localhost:8000/chat/conversations/fetch_or_create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    sender: senderId,
                    receiver: receiverId
                }),
            });

            const responseData = await response.json();

            console.error('Case:', responseData.case);
            switch (responseData.case) {
                case 'missing_data':
                    console.error('Missing sender or receiver');
                    break;
                case 'user_not_found':
                    console.error('One of the users does not exist');
                    break;
                case 'sender_blocked_receiver':
                    this.querySelector(".block-message").innerHTML = "You have blocked this user and cannot send messages.";
                    console.error('You have blocked this user');
                    this.caseBlock();
                    this.toggleBlockButton("unblock");
                    break;
                case 'receiver_blocked_sender':
                    this.querySelector(".block-message").innerHTML = "You are blocked by this user and cannot send messages.";
                    console.error('You are blocked by this user');
                    this.caseBlock();
                    this.toggleBlockButton("block");
                    break;
                case 'conversation_created':
                    console.log('Conversation created:', responseData.conversation);
                    this.toggleBlockButton("block");
                    break;
                case 'conversation_fetched':
                    console.log('Fetched conversation:', responseData.conversation);
                    this.toggleBlockButton("block");
                    break;
                default:
                    console.error('Unknown case:', responseData.case);
            }

            return responseData.conversation;
        } catch (error) {
            console.error('Error:', error);
        }
    }
    // async fetchOrCreateConversation(senderId, receiverId) {
    //     try {
    //         const response = await fetch(`http://localhost:8000/chat/conversations/fetch_or_create/`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${this.token}`
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({
    //                 sender: senderId,
    //                 receiver: receiverId
    //             }),
    //         });

    //         if (response.ok) {
    //             const conversation = await response.json();
    //             console.log('Fetched or created conversation:', conversation);
    //             return conversation;
    //         } else {
    //             const errorData = await response.json();
    //             console.error('Error fetching or creating conversation:', errorData.detail || response.statusText);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    async fetchMessagesForConversation(conversationId) {
        try {
            const response = await fetch(`http://localhost:8000/chat/messages/fetch_messages/?conversation_id=${conversationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
            });

            if (response.ok) {
                const messages = await response.json();
                console.log('Fetched messages for conversation:', messages);
                this.displayMessages(messages);
            } else {
                const errorData = await response.json();
                console.error('Error fetching messages:', errorData.detail || response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayNewMessage(data)
    {
        console.log("got a new message");
        let messageHTML = '';
        if (data.sender != this.user.id)
        {
            messageHTML = `
                <div class="slot_message_container___">
                    <div class="message_container__ second_msg_user">
                        <div class="message_user_container__">
                            <div class="message_user_content__">
                                ${data.message}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        else
        {
            messageHTML = `
                <div class="slot_message_container___">
                    <div class="message_container__ first_msg_user">
                        <div class="message_user_container__">
                            <div class="message_user_content__">
                                ${data.message}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        this.chatContainer.innerHTML += messageHTML;
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // this for showing the very last messages of the conversation
    }
    displayMessages(messages) {
        this.chatContainer = this.querySelector('.slots_messages_container__');
        this.chatContainer.innerHTML = '';

        messages.forEach(message => {
            let messageHTML = '';
            if (message.sender != this.user.id) {
                messageHTML = `
                    <div class="slot_message_container___">
                        <div class="message_container__ second_msg_user">
                            <div class="message_user_container__">
                                <div class="message_user_content__">
                                    ${message.message}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                messageHTML = `
                    <div class="slot_message_container___">
                        <div class="message_container__ first_msg_user">
                            <div class="message_user_container__">
                                <div class="message_user_content__">
                                    ${message.message}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            this.chatContainer.innerHTML += messageHTML;
        });
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // this for showing the very last messages of the conversation
    }

    displayMessage(message) {
        if (message.sender === this.receiverId || message.receiver === this.receiverId) {
            this.displayMessages([message]);
        }
    }

    async sendMessage() {
        if (!this.receiverId) {
            console.error('No receiver selected');
            this.clearChatArea();
            return;
        }

        const messageContent = document.querySelector('.message-input').value;
        if (messageContent.trim().length != 0)
        {
            const messageData = {
                sender: this.user.id,
                message: messageContent,
                timestamp: new Date().toISOString(),
                conversation: this.conversationId
            };

            // this.websocket.send(JSON.stringify(messageData));

            try {
                const response = await fetch('http://localhost:8000/chat/messages/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(messageData),
                });

                if (response.ok) {
                    const data = await response.json();
                    const dataWs = {
                        message: data.message,
                        sender: data.sender
                    };
                    this.websocket.send(JSON.stringify(dataWs));
                    console.log('Message saved:', data);
                    document.querySelector('.message-input').value = '';
                    // this.displayMessage(data);
                } else {
                    const errorData = await response.json();
                    console.error('Error saving message:', errorData.detail || response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    async get_blocked()
    {
        try {
            const response = await fetch(`http://localhost:8000/chat/users/blocked_users/?user_id=${this.user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();

                console.log("blocked users : " +data);
                this.fetchUsers();


            } else {
                console.error('error block');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    clearChatArea() {
        this.querySelector('.second_section_wrapper_chat').innerHTML = '';
        this.querySelector('.second_section_wrapper_chat').style.display = 'none';
    }
    async blockOrUnblockUser()
    {
        try {
            let apiUrl = `http://localhost:8000/chat/users/block/`;
            if (this.querySelector(".block-btn").innerHTML == "unblock")
                apiUrl = `http://localhost:8000/chat/users/unblock/`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
                body: JSON.stringify({ blocker: this.user.id, blocked: this.receiverId })
            });

            if (response.ok) {
                const data = await response.json();

                console.log("block response : "+data.user);
                if (this.querySelector(".block-btn").innerHTML == "unblock")
                {
                    this.toggleBlockButton("block");
                    this.fetchOrCreateConversation(this.user.id, this.receiverId);
                    this.querySelector('.blocked-user-message').style.display = 'none';
                    this.querySelector('.input_conv_container__chat').style.display = 'flex';
                }
                else if (this.querySelector(".block-btn").innerHTML == "block")
                {
                    this.toggleBlockButton("unblock");
                    this.fetchOrCreateConversation(this.user.id, this.receiverId);
                    this.querySelector('.blocked-user-message').style.display = 'block';
                    this.querySelector('.input_conv_container__chat').style.display = 'none';
                }
            // this.fetchOrCreateConversation(this.user.id, this.receiverId);
            } else {
                console.error('error block');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    // async unblockUser()
    // {
    //     try {
    //         const response = await fetch(`http://localhost:8000/chat/users/unblock/`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${this.token}`
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({ blocker: this.user.id, blocked: this.receiverId })
    //         });

    //         if (response.ok) {
    //             const data = await response.json();

    //             console.log("block response : "+data.user);
    //             this.fetchUsers();

    //         } else {
    //             console.error('error block');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }
    clearChatArea() {
        this.querySelector('.second_section_wrapper_chat').innerHTML = '';
        this.querySelector('.second_section_wrapper_chat').style.display = 'none';
    }

    setupEventListeners() {
        const sendButton = this.querySelector('.send-button');
        document.querySelector('.message-input').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendButton.click();
            }
        });
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        const blockButton = this.querySelector('.block-btn');

        blockButton.addEventListener('click', () => {
            this.blockOrUnblockUser();
        });


    }
    toggleBlockButton(state)
    {
        if (state == "block")
            this.querySelector(".block-btn").innerHTML = "block";
        else if (state == "unblock")
            this.querySelector(".block-btn").innerHTML = "unblock";

    }
    render() {
        this.innerHTML = /*html*/`

            <div class="chat_wrapper_">
                <div class="first_section_wrapper_chat">

                </div>
                <div class="find_conv">
                        <i class="fa-duotone fa-solid fa-comments"></i>
                        <h1>select a conversation to start chatting</h1>
                        <p>or find a frind and chat</p>
                        <button class="find_friends">find friends</button>
                </div>
                <div class="second_section_wrapper_chat">
                      <div class="wrapper_first_con_second_section">
                      <div class="first_wrapper_info_user_chat_wrapper">
                          <div class="first_side_wrapper_con_chat__">
                              <img src="../assets/pdp.png" alt="logo_user" class="logo_chat_user">
                              <div class="infos_con_user_wrapper">
                                  <h3 class="name_user_con" id="username">
                                  </h3>
                                  <p class="status_user_con">
                                      Online
                                  </p>
                                  <button class="block-btn">block</button>
                              </div>
                          </div>
                          <div class="second_side_wrapper_con_chat__">
                              <button class='play_invite'>
                              <i class="fa-solid fa-gamepad-modern fa-2xl"></i>
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
                                    <p class="block-message">You are blocked and cannot send messages.</p>
                                </div>
                                <div class="input_conv_container__chat">
                                    <textarea name="" id="" class="send_msg_input message-input" rows="1" placeholder="Message"></textarea>
                                    <button class="send-button">Send</button>
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
        `;

        this.chatContainer = this.querySelector('.slots_messages_container__');
        this.userContainer = this.querySelector('.first_section_wrapper_chat');
        const textArea = this.querySelector(".send_msg_input");
        textArea.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
        });
        this.querySelector('.second_section_wrapper_chat').style.display = 'none';

    }
}

customElements.define("chat-page", Chat);
