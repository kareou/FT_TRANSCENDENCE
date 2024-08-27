import Http from "../http/http.js";

export default class Chat extends HTMLElement {
    constructor() {
        super();
        this.user = Http.user;
        this.token = localStorage.getItem('token');
        this.receiverId = null;
        this.conversationId = null;
        this.chatContainer = null;
        this.conversations = [];
        // this.activeConversationId = this.getAttribute();
    }

    connectedCallback() {
        this.render();
        this.fetchUsers();
        this.setupEventListeners();
    }
    isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[date.getDay()];
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${dayName}, ${month}/${day}/${year}`;
    }


    setupWebSocket() {
        // console.log("size = " +this.conversations.length);
        this.conversations.forEach(conversation => {
            
            
            conversation.websocket.addEventListener("open", function (event) {
                console.log("WebSocket connection opened with sender " +conversation.senderId+ " and reciever : "  +conversation.receiverId);
            });
                
            conversation.websocket.onmessage = this.handleWebSocketMessage.bind(this);
    
            conversation.websocket.addEventListener("close", function (event) {
                console.log("WebSocket connection closed.");
            });

        })

    }
    handleWebSocketMessage(event) {
        const message = JSON.parse(event.data);

        if (message.type == "message")
            this.displayNewMessage(message);
        else if (message.type == "block_notification")
        {
            const userElements = this.querySelectorAll('.chat_bulles_wrapper');
            userElements.forEach(userElement => {
                if (userElement.id == message.blocker || userElement.id == message.blocked)
                {
                    userElement.click();
                }
            });
        }        
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
        userContainer.innerHTML = `
        <div class="first_profile_wrapper_chat">
            <div class="pdp_warpper">
                <img src="http://localhost:8000${this.user.profile_pic}" class="pfp_logo" alt="profile picture" loading="lazy">
                <div class="txt_one">Chats</div>
            </div>
            <div class="icon_wrapper_">
                <i class="fa-solid fa-circle-ellipsis fa-2xl" style="color: #ffffff;"></i>
            </div>
        </div>
        `;

        users.forEach(user => {
            const userElementHTML = /* HTML */ `
            <div class="chat_bulles_wrapper user" id="${user.id}" name="${user.username}">
                <div class="chat_bulle_wrapper">
                    <div class="chat_pdp_wrapper" style="position: relative;">
                        <user-avatar image="${user.profile_pic}" state="online" width="70" height="70"></user-avatar>
                    </div>
                    <div class="data_chat_bulle_wrapper">
                        <div class="name_bulle_chat">${user.username}</div>
                        <div class='last_msg'></div>
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
            const receiverId = userElement.id;
            const senderId = this.user.id;
            this.receiverId = receiverId;
            const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${senderId}/${receiverId}/`)
            const newConversation = {senderId, receiverId, websocket};
            this.conversations.push(newConversation);
            
            userElement.addEventListener('click', () => {
                this.querySelector('.blocked-user-message').style.display = 'none';
                this.querySelector('.input_conv_container__chat').style.display = 'flex';

                this.fetchOrCreateConversation(senderId, receiverId).then(conversation => {
                    if (conversation.id != this.conversationId)
                    {
                        this.conversationId = conversation.id;
                        console.log("conversation : " + conversation.conversation);
                        console.log("conversation id : " + conversation.id);
                        this.fetchMessagesForConversation(conversation.id);
                        const username = userElement.getAttribute("name");
                        this.querySelector(".infos_con_user_wrapper").setAttribute("href", `/dashboard/profile/?user=${username}`);
                        this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
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
                });
            });
        });
        this.setupWebSocket();
    }
    caseBlock()
    {

        this.querySelector('.blocked-user-message').style.display = 'block';
        this.querySelector('.input_conv_container__chat').style.display = 'none';
    }

    async fetchOrCreateConversation(senderId, receiverId) {
        // console.log("sender : " +senderId);
        // console.log("receiver : " +receiverId);
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
                    // this.querySelector('.block-btn').classList.remove('hidden');
                    this.toggleBlockButton("unblock");
                    break;
                case 'receiver_blocked_sender':
                    this.querySelector(".block-message").innerHTML = "You are blocked by this user and cannot send messages.";
                    console.error('You are blocked by this user');
                    this.caseBlock();
                    // this.querySelector('.block-btn').style.display = 'none';
                    this.querySelector('.block-btn').classList.add('hidden');
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
    async fetchOrCreateConversationAndVerifyBlock(senderId, receiverId) {
        // console.log("sender : " +senderId);
        // console.log("receiver : " +receiverId);
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
                    return 0;
                case 'user_not_found':
                    return 0;
                case 'sender_blocked_receiver':
                    return 0;
                case 'receiver_blocked_sender':
                    return 0;
                case 'conversation_created':
                   return 1;
                case 'conversation_fetched':
                    return 1;
            }
            return 1;
        } catch (error) {
            console.error('Error:', error);
        }
    }

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
        let messageHTML = '';
        
        if (data.sender != this.user.id)
        {
            messageHTML = `
                <div class="slot_message_container___">
                    <div class="message_container__ second_msg_user">
                        <div class="message_user_container__ right_side_msg">
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
        const userElements = this.querySelectorAll('.chat_bulles_wrapper');
        console.log("log iser : " +this.user.id);
        userElements.forEach(userElement => {
            console.log("id : " +userElement.getAttribute("id")+ " rec : " + data.sender);
            if (userElement.getAttribute("id") == data.sender)
            {
                console.log("test " +userElement.getAttribute("id"));
                userElement.querySelector('.last_msg').innerHTML = data.message;
            }
        })

        this.chatContainer.innerHTML += messageHTML;
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // this for showing the very last messages of the conversation
    }
    
    
    displayMessages(messages) {
        this.chatContainer = this.querySelector('.slots_messages_container__');
        this.chatContainer.innerHTML = '';
// console.log('pic = '+this.user.profile_pic);
        // const receiverImg = this.querySelector(".logo_chat_user").src;
        messages.forEach(message => {
            const message_time =  this.isToday(message.timestamp) ? this.formatTime(message.timestamp) : this.formatDate(message.timestamp);
        
            let messageHTML = '';
            if (message == messages[messages.length -1])
            {
                const userElements = this.querySelectorAll('.chat_bulles_wrapper');

                userElements.forEach(userElement => {
                    if (userElement.getAttribute("id") == this.receiverId || userElement.getAttribute("id") == message.sender)
                    userElement.querySelector('.last_msg').innerHTML = messages[messages.length -1].message;
                })
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
                            <img src="${this.querySelector(".logo_chat_user").src}" class="user_pic_msg_right" alt="profile picture" loading="lazy">
                        </div>
                    </div>
                `;
                // 
                
            } else {
                messageHTML = `
                    <div class="slot_message_container___">
                    <div class="message_container__ first_msg_user">
                    <img src="http://localhost:8000${this.user.profile_pic}" class="user_pic_msg_left" alt="profile picture" loading="lazy">
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
            
            // console.log('1->'+receiverImg);
            // this.querySelector(".user_pic_msg_right").src = '';
            // this.querySelector(".user_pic_msg_right").src = receiverImg;
            // console.log('2->'+this.querySelector(".user_pic_msg_right").src);
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
            // console.log("result = "+this.fetchOrCreateConversationAndVerifyBlock(this.user.id, this.receiverId));
            
            const checkConversation = await this.fetchOrCreateConversationAndVerifyBlock(this.user.id, this.receiverId);
            console.log("result = " + checkConversation);
            
            if (checkConversation === 0) {
                console.log('Action aborted: User is blocked or conversation could not be created.');
                return; // Stop further execution
            }
            try {
                const response = await fetch('http://localhost:8000/chat/messages/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    credentials: 'include',
                    body: JSON.stringify(messageData),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Message saved via api:', data);
                    const dataWs = {
                        type: 'message',
                        message: data.message,
                        sender: data.sender,
                    };
                    this.conversations.forEach(conversation => {
                    if ((conversation.senderId == this.user.id && conversation.receiverId == this.receiverId) || (conversation.senderId == this.receiverId && conversation.receiverId == this.user.id))
                    {
                        conversation.websocket.send(JSON.stringify(dataWs));
                        console.log('Message sent via ws:', dataWs);
                        document.querySelector('.message-input').value = '';
                    }

                    })
                } else {
                    const errorData = await response.json();
                    console.error('Error saving message:', errorData.detail || response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }


    clearChatArea() {
        this.querySelector('.second_section_wrapper_chat').innerHTML = '';
        this.querySelector('.second_section_wrapper_chat').style.display = 'none';
    }
    async blockOrUnblockUser()
    {
        try {
            let apiUrl = `http://localhost:8000/api/friends/block/`;
            if (this.querySelector(".block-btn").innerHTML == "unblock")
                apiUrl = `http://localhost:8000/api/friends/unblock/`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                credentials: 'include',
                body: JSON.stringify({ user1: this.user.id, user2: this.receiverId })
            });

            if (response.ok)
            {
                this.conversations.forEach(conversation => {
                    if (conversation.senderId == this.user.id && conversation.receiverId == this.receiverId)
                    {
                        const dataWs = {
                            type: 'block_notification',
                            sender : this.user.id,
                            blocker: this.user.id,
                            blocked: this.receiverId,
                        };
                        conversation.websocket.send(JSON.stringify(dataWs));
                    }
                })
            }
            else
            {
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

    setupEventListeners() {
        const sendButton = this.querySelector('.send-button');
        const sendInput = document.querySelector('.message-input');
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
        this.innerHTML = /* HTML */`

        <div class="chat_wrapper_">
        <div class="modal_wrapper_chat">
        <div class="overlay_chat"></div>
        <div class="modal_content_wrapper">
            <div class="search_input_wrapper_">
                <input type="text" name="search" id="search" class="search" placeholder="What are you looking for ?">
            </div>
            <div class="users_search_list_wrapper">
                <div class="user_wrapper_search">
                    <img src="bg_img.png" alt="" width="30" height="30" class="user_img_search">
                    <div class="fullname_search">Full Name</div>
                    <div class="user_name_search">User Name</div>
                </div>

                <div class="user_wrapper_search">
                    <img src="bg_img.png" alt="" width="30" height="30" class="user_img_search">
                    <div class="fullname_search">Full Name</div>
                    <div class="user_name_search">User Name</div>
                </div>
                <div class="user_wrapper_search">
                    <img src="bg_img.png" alt="" width="30" height="30" class="user_img_search">
                    <div class="fullname_search">Full Name</div>
                    <div class="user_name_search">User Name</div>
                </div>
            </div>
        </div>
    </div>
            <div class="first_section_wrapper_chat">

            </div>
            <div class="find_conv">
                     <i class="fa-duotone fa-solid fa-comments"></i>

                    <h1>select a conversation to start chatting</h1>
                    <p>or find a friend and chat</p>
                    <button class="find_friends">Find Friends <i class="fa-light fa-user-group"></i> </button>
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

                          </div>
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
                                <p class="block-message">You are blocked and cannot send messages.</p>
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
