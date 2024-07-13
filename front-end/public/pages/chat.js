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
                        <img src="http://localhost:8000${this.user.profile_pic}" alt="profile picture" class="pfp_logo">
                        <div class="txt_one">Chats</div>

                    </div>
                    <div class="icon_wrapper_">
                        <img src="../assets/Group 33.png" alt="grp33" class="grp_33">
                    </div>
                </div>`; 

        users.forEach(user => {
            const userElementHTML = `
                <div class="chat_bulles_wrapper user" id="${user.id}" name="${user.username}">
                    <div class="chat_bulle_wrapper">
                        <div class="chat_pdp_wrapper">
                            <img src='${user.profile_pic}' alt="ellipse 20" class="pdp_logo_chat">
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
                const receiverId = userElement.id;
                const senderId = this.user.id;
                this.receiverId = receiverId;
                this.fetchOrCreateConversation(senderId, receiverId).then(conversation => {
                    this.conversationId = conversation.id; // Set the conversation ID attribute
                    console.log("conversation : " + conversation);
                    console.log("conversation id : " + conversation.id);
                    this.setupWebSocket();
                    this.fetchMessagesForConversation(conversation.id);
                    this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
                    this.querySelector(".second_section_wrapper_chat").style.display = 'block';
                });
            });
        });
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

            if (response.ok) {
                const conversation = await response.json();
                console.log('Fetched or created conversation:', conversation);
                return conversation;
            } else {
                const errorData = await response.json();
                console.error('Error fetching or creating conversation:', errorData.detail || response.statusText);
            }
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
                        'Authorization': `Bearer ${this.token}`
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
    }

    render() {
        this.innerHTML = `
            <div class="chat_wrapper_">
                <div class="first_section_wrapper_chat">
                    
                </div>
                <div class="second_section_wrapper_chat">
                    <div class="wrapper_first_con_second_section">
                            <div class="first_wrapper_info_user_chat_wrapper">
                                <div class="first_side_wrapper_con_chat__">
                                    <img src="../assets/pdp.png" alt="logo_user" class="logo_chat_user">
                                    <div class="infos_con_user_wrapper">
                                        <h3 class="name_user_con" id="username">
                                            mourad
                                        </h3>
                                        <p class="status_user_con">
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <div class="second_side_wrapper_con_chat__">
                                    <img src="../assets/info_icon.png" alt="info logo" class="info_logo_">
                                </div>
                            </div>
                    </div>
                    <div class="chat_container_conv__">
                            <div class="conv_data_container_chat__">
                                <div class="slots_messages_container__">

                                </div>
                            </div>
                            <div class="input_conv_container__chat">
                                <input type="text" class="send_msg_input message-input" placeholder="Aa">
                                <button class="send-button">Send</button>
                            </div>
                    </div>
                </div>
            </div>
        `;

        this.chatContainer = this.querySelector('.slots_messages_container__');
        this.userContainer = this.querySelector('.first_section_wrapper_chat');

        this.querySelector('.second_section_wrapper_chat').style.display = 'none';
    }
}

customElements.define("chat-page", Chat);
// import Http from "../http/http.js";

// export default class Chat extends HTMLElement {
//     constructor() {
//         super();
//         this.user = Http.user;
//         this.token = localStorage.getItem('token');
//         this.receiverId = null;
//         this.chatContainer = null;
//         this.websocket = null;
//     }

//     connectedCallback() {
//         this.render();
//         this.fetchUsersWithConversations();
//         // this.setupWebSocket();
//         this.setupEventListeners();
//     }

//     setupWebSocket() {
//         this.websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${this.user.id}/${this.receiverId}/`);

//         this.websocket.addEventListener("open", function (event) {
//             console.log("WebSocket connection opened.");
//         });

//         this.websocket.onmessage = this.handleWebSocketMessage.bind(this);

//         this.websocket.addEventListener("close", function (event) {
//             console.log("WebSocket connection closed.");
//         });
//     }
//     handleWebSocketMessage(event) {
//         const message = JSON.parse(event.data);
//         console.log(message.sender);
//         console.log("ws got " + message.message);
//         // console.log(this.receiverId);
        
//         // if (message.sender == this.user.id)
//             this.displayNewMessage(message);
//         // this.fetchChatData(this.user.id, this.receiverId);
//     }
    

//     async fetchChatData(senderId, receiverId) {
//         try {
//             const response = await fetch(`http://localhost:8000/chat/messages/conversation/?sender_id=${senderId}&receiver_id=${receiverId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 credentials: 'include',
//             });

//             if (response.ok) {
//                 const chatData = await response.json();
//                 console.log(chatData);
//                 this.displayMessages(chatData);
//             } else {
//                 const errorData = await response.json();
//                 console.error('Error fetching chat data:', errorData.detail || response.statusText);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     async fetchUsersWithConversations() {
//         try {
//             const response = await fetch(`http://localhost:8000/chat/users/conversations/`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 credentials: 'include',
//             });

//             if (response.ok) {
//                 const users = await response.json();
//                 console.log('Users with conversations:', users);
//                 this.displayUsers(users);
//             } else {
//                 console.error('Error fetching users with conversations:', response.statusText);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     displayUsers(users) {
//         const userContainer = this.querySelector('.first_section_wrapper_chat');
//         userContainer.innerHTML = '';
//         userContainer.innerHTML = 
//                     `<div class="first_profile_wrapper_chat">
//                         <div class="pdp_warpper">
//                             <img src="http://localhost:8000${this.user.profile_pic}" class="pfp_logo">
//                             <div class="txt_one">Chats</div>

//                         </div>
//                         <div class="icon_wrapper_">
//                             <i class="fa-solid fa-circle-ellipsis fa-2xl" style="color: #ffffff;"></i>
//                         </div>
//                     </div>`; 
        
//         users.forEach(user => {
//             const userElementHTML = `
//                 <div class="chat_bulles_wrapper user" id="${user.id}" name="${user.username}">
//                     <div class="chat_bulle_wrapper">
//                         <div class="chat_pdp_wrapper">
//                             <img src="http://localhost:8000${user.profile_pic}" alt="ellipse 20" class="pdp_logo_chat">
//                         </div>
//                         <div class="data_chat_bulle_wrapper">
//                             <div class="name_bulle_chat">${user.username}</div>
//                         </div>
//                     </div>
//                 </div>
//             `;
            
//             userContainer.innerHTML += userElementHTML;
//         });

//         this.addUserClickListeners();
//     }

//     addUserClickListeners() {
//         const userElements = this.querySelectorAll('.chat_bulles_wrapper');

//         userElements.forEach(userElement => {
//             userElement.addEventListener('click', () => {
//                 const receiverId = userElement.id;
//                 const senderId = this.user.id;
//                 this.receiverId = receiverId;
//                 this.fetchChatData(senderId, receiverId);
//                 this.setupWebSocket();
//                 this.querySelector(".logo_chat_user").src = userElement.querySelector(".pdp_logo_chat").src;
//                 this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
//                 this.querySelector(".second_section_wrapper_chat").style.display = 'block';
//             });
//         });
//     }
//     displayNewMessage(data)
//     {
//         console.log("got a new message");
//         let messageHTML = '';
//         if (data.sender != this.user.id)
//         {
//             messageHTML = `
//                 <div class="slot_message_container___">
//                     <div class="message_container__ second_msg_user">
//                         <div class="message_user_container__">
//                             <div class="message_user_content__">
//                                 ${data.message}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }
//         else
//         {
//             messageHTML = `
//                 <div class="slot_message_container___">
//                     <div class="message_container__ first_msg_user">
//                         <div class="message_user_container__">
//                             <div class="message_user_content__">
//                                 ${data.message}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }
    
//         this.chatContainer.innerHTML += messageHTML;
//         this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // this for showing the very last messages of the conversation
//     }
//     displayMessages(messages) {
//         this.chatContainer = this.querySelector('.slots_messages_container__');
//         this.chatContainer.innerHTML = '';
    
//         messages.forEach(message => {
//             let messageHTML = '';
//             if (message.sender != this.user.id) {
//                 messageHTML = `
//                     <div class="slot_message_container___">
//                         <div class="message_container__ second_msg_user">
//                             <div class="message_user_container__">
//                                 <div class="message_user_content__">
//                                     ${message.message}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//             } else {
//                 messageHTML = `
//                     <div class="slot_message_container___">
//                         <div class="message_container__ first_msg_user">
//                             <div class="message_user_container__">
//                                 <div class="message_user_content__">
//                                     ${message.message}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//             }
    
//             this.chatContainer.innerHTML += messageHTML;
//         });
//         this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // this for showing the very last messages of the conversation

//     }

//     displayMessage(message) {
//         if (message.sender === this.receiverId || message.receiver === this.receiverId) {
//             this.displayMessages([message]);
//         }
//     }

//     async sendMessage() {
//         if (!this.receiverId) {
//             console.error('No receiver selected');
//             this.clearChatArea();
//             return;
//         }
    
//         const messageContent = document.querySelector('.message-input').value;
        
//         if (messageContent.trim().length != 0)
//         {
//             const messageData = {
        //     sender: this.user.id,
        //     content: messageContent,
        //     timestamp: new Date().toISOString(),
        //     conversation: this.conversationId // Include conversation ID
        // };
//            
//             try {
//                 const response = await fetch('http://localhost:8000/chat/messages/', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     credentials: 'include',
//                     body: JSON.stringify(messageData),
//                 });
        
//                 if (response.ok) {
//                     const data = await response.json();
//                     const dataWs = {
//                         message: data.message,
//                         sender: data.sender
//                     };
//                     this.websocket.send(JSON.stringify(dataWs));
//                     console.log('Message saved:', data);
//                     document.querySelector('.message-input').value = '';
//                     // this.displayMessage(data);
//                 } else {
//                     console.error('Error saving message:', response.statusText);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         }
//     }
    

//     clearChatArea() {
//         this.querySelector('.second_section_wrapper_chat').innerHTML = '';
//         this.querySelector('.second_section_wrapper_chat').style.display = 'none';
//     }

//     setupEventListeners() {
//         const sendButton = this.querySelector('.send-button');
//         document.querySelector('.message-input').addEventListener('keypress', function (event) {
//             if (event.key === 'Enter') {
//                 event.preventDefault();
//                 sendButton.click();
//             }
//         });
//         sendButton.addEventListener('click', () => {
//             this.sendMessage();
//         });
        
//     }

//     render() {
//         this.innerHTML = /*html*/`
//             <div class="chat_wrapper_">
//                 <div class="first_section_wrapper_chat">
//                     <-- conversations/users will be displayed here !-->
//                 </div>
//                 <div class="second_section_wrapper_chat">
//                     <div class="wrapper_first_con_second_section">
//                             <div class="first_wrapper_info_user_chat_wrapper">
//                                 <div class="first_side_wrapper_con_chat__">
//                                     <img src="../assets/pdp.png" alt="logo_user" class="logo_chat_user">
//                                     <div class="infos_con_user_wrapper">
//                                         <h3 class="name_user_con" id="username">
//                                             mourad
//                                         </h3>
//                                         <p class="status_user_con">
//                                             Online
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div class="second_side_wrapper_con_chat__">
//                                     <img src="../assets/info_icon.png" alt="info logo" class="info_logo_">
//                                 </div>
//                             </div>
//                     </div>
//                     <div class="chat_container_conv__">
//                             <div class="conv_data_container_chat__">
//                                 <div class="slots_messages_container__">
//                                     <-- messages will be displayed here !-->
//                                 </div>
//                             </div>
//                             <div class="input_conv_container__chat">
//                                 <input type="text" class="send_msg_input message-input" placeholder="Aa">
//                                 <button class="send-button">Send</button>
//                             </div>
//                             <div>
//                                 <div class="prompt hidden">
//                                     <select class="users-options">
//                                         <-- users will be displayed here !-->
//                                     </select>
//                                 </div>
//                             </div>
//                     </div>
//                 </div>
//             </div>
//         `;

//         this.chatContainer = this.querySelector('.slots_messages_container__');
//         this.userContainer = this.querySelector('.first_section_wrapper_chat');

//         this.querySelector('.second_section_wrapper_chat').style.display = 'none';
//     }
// }

// customElements.define("chat-page", Chat);
