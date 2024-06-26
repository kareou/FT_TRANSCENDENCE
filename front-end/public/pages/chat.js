import Http from "../http/http.js"; // Adjust the path as necessary

export default class Chat extends HTMLElement {
    constructor() {
        super();
        this.user = Http.user; // Assuming Http.user provides logged-in user data
        this.token = localStorage.getItem('token'); // Assuming Http.token provides the authentication token
        this.receiverId = null; // Will be set when a user is selected
        this.chatContainer = null; // Reference to chat container element
        this.websocket = null; // WebSocket connection
    }

    connectedCallback() {
        this.render();
        this.fetchUsersWithConversations(); // Fetch users with whom the logged-in user has conversations
        this.setupEventListeners();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.websocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/");

        // Handle WebSocket connection open
        this.websocket.addEventListener("open", function (event) {
            console.log("WebSocket connection opened.");
        });

        // Handle WebSocket message received
        // this.websocket.addEventListener("message", function (event) {
        //     const message = JSON.parse(event.data);
        //     console.log("ws got " +message);
        //     fetchChatData(Http.user.id, this.receiverId);
        //     // this.displayMessage(message);
        // });
        this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
        // Handle WebSocket close
        this.websocket.addEventListener("close", function (event) {
            console.log("WebSocket connection closed.");
        });
    }
    handleWebSocketMessage(event) {
        const message = JSON.parse(event.data);
        console.log("ws got " + message);
        this.fetchChatData(this.user.id, this.receiverId);
        // this.displayMessage(message);
    }
    

    async fetchChatData(senderId, receiverId) {
        try {
            const response = await fetch(`http://localhost:8000/chat/messages/conversation/?sender_id=${senderId}&receiver_id=${receiverId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
            });

            if (response.ok) {
                const chatData = await response.json();
                console.log(chatData);
                this.displayMessages(chatData);
            } else {
                const errorData = await response.json();
                console.error('Error fetching chat data:', errorData.detail || response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async fetchUsersWithConversations() {
        try {
            const response = await fetch(`http://localhost:8000/chat/users/conversations/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}` // Include the authorization header
                },
            });

            if (response.ok) {
                const users = await response.json();
                console.log('Users with conversations:', users);
                this.displayUsers(users); // Display users in the sidebar
            } else {
                console.error('Error fetching users with conversations:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayUsers(users) {
        const userContainer = this.querySelector('.first_section_wrapper_chat');
        userContainer.innerHTML = `<div class="first_profile_wrapper_chat">
                        <div class="pdp_warpper">
                            <img src="../assets/pdp.png" alt="profile picture" class="pfp_logo">
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
                            <img src="../assets/Ellipse 20.png" alt="ellipse 20" class="pdp_logo_chat">
                        </div>
                        <div class="data_chat_bulle_wrapper">
                            <div class="name_bulle_chat">${user.username}</div>
                        </div>
                    </div>
                </div>
            `;
            
            userContainer.innerHTML += userElementHTML;
        });

        // Add event listeners after rendering user elements
        this.addUserClickListeners();
    }

    addUserClickListeners() {
        const userElements = this.querySelectorAll('.chat_bulles_wrapper');

        userElements.forEach(userElement => {
            userElement.addEventListener('click', () => {
                const receiverId = userElement.id; // Get the ID of the clicked user
                const senderId = this.user.id; // Assuming logged-in user's ID
                this.receiverId = receiverId; // Set the receiverId
                this.fetchChatData(senderId, receiverId); // Fetch conversation for selected user
                this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
                this.querySelector(".second_section_wrapper_chat").style.display = 'block'; // Ensure the chat section is visible
            });
        });
    }

    displayMessages(messages) {
        this.chatContainer = this.querySelector('.slots_messages_container__');
        // const shouldScrollToBottom = this.chatContainer.scrollTop + this.chatContainer.clientHeight === this.chatContainer.scrollHeight;
        this.chatContainer.innerHTML = ''; // Clear previous messages
    
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
        // if (shouldScrollToBottom) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        // }
    }

    displayMessage(message) {
        if (message.sender === this.receiverId || message.receiver === this.receiverId) {
            this.displayMessages([message]);
        }
    }

    async sendMessage() {
        if (!this.receiverId) {
            console.error('No receiver selected');
            this.clearChatArea(); // Clear chat area if no receiver is selected
            return;
        }
    
        const messageContent = document.querySelector('.message-input').value;
        const messageData = {
            sender: this.user.id, // Assuming this.user has sender's ID
            receiver: this.receiverId, // Set the receiverId
            message: messageContent,
            timestamp: new Date().toISOString(), // Assuming timestamp is managed by backend
        };
        // this.chatContainer.innerHTML += `<div class="slot_message_container___">
        //                 <div class="message_container__ second_msg_user">
        //                     <div class="message_user_container__">
        //                         <div class="message_user_content__">
        //                             ${messageContent}
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>`;
        
        // Ensure message is sent as JSON string
        this.websocket.send(JSON.stringify(messageData));
        
        try {
            const response = await fetch('http://localhost:8000/chat/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}` // Assuming token is stored in localStorage
                },
                body: JSON.stringify(messageData),
            });
    
            if (response.ok) {
                const data = await response.json();
                this.websocket.send(JSON.stringify(data));
                console.log('Message saved:', data);
                document.querySelector('.message-input').value = ''; // Clear input field
                this.displayMessage(data); // Display the new message
            } else {
                console.error('Error saving message:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    

    clearChatArea() {
        this.querySelector('.second_section_wrapper_chat').innerHTML = ''; // Clear chat section
        this.querySelector('.second_section_wrapper_chat').style.display = 'none'; // Hide chat section
    }

    setupEventListeners() {
        const sendButton = this.querySelector('.send-button');
    
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    render() {
        this.innerHTML = /*html*/`
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

        this.chatContainer = this.querySelector('.slots_messages_container__'); // Set chat container reference
        this.userContainer = this.querySelector('.first_section_wrapper_chat'); // Set chat container reference

        // Initially hide the chat section
 // Set chat container reference

        // Initially hide the chat section
        this.querySelector('.second_section_wrapper_chat').style.display = 'none';
    }
}

customElements.define("chat-page", Chat);


// import Http from "../http/http.js"; // Adjust the path as necessary

// export default class Chat extends HTMLElement {
//     constructor() {
//         super();
//         this.user = Http.user; // Assuming Http.user provides logged-in user data
//         this.token = localStorage.getItem('token'); // Assuming Http.token provides the authentication token
//         this.receiverId = null; // Will be set when a user is selected
//         this.chatContainer = null; // Reference to chat container element
//     }

//     connectedCallback() {
//         this.render();
//         this.fetchUsersWithConversations(); // Fetch users with whom the logged-in user has conversations
//         this.setupEventListeners();
//     }

//     async fetchChatData(senderId, receiverId) {
//         try {
//             const response = await fetch(`http://localhost:8000/chat/messages/conversation/?sender_id=${senderId}&receiver_id=${receiverId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${this.token}`
//                 },
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
//                     'Authorization': `Bearer ${this.token}` // Include the authorization header
//                 },
//             });

//             if (response.ok) {
//                 const users = await response.json();
//                 console.log('Users with conversations:', users);
//                 this.displayUsers(users); // Display users in the sidebar
//             } else {
//                 console.error('Error fetching users with conversations:', response.statusText);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     displayUsers(users) {
//         const userContainer = this.querySelector('.first_section_wrapper_chat');
//         userContainer.innerHTML = `<div class="first_profile_wrapper_chat">
//                         <div class="pdp_warpper">
//                             <img src="../assets/pdp.png" alt="profile picture" class="pfp_logo">
//                             <div class="txt_one">Chats</div>

//                         </div>
//                         <div class="icon_wrapper_">
//                             <img src="../assets/Group 33.png" alt="grp33" class="grp_33">
//                         </div>
//                     </div>`; 
        
//         users.forEach(user => {
//             const userElementHTML = `
//                 <div class="chat_bulles_wrapper user" id="${user.id}" name="${user.username}">
//                     <div class="chat_bulle_wrapper">
//                         <div class="chat_pdp_wrapper">
//                             <img src="../assets/Ellipse 20.png" alt="ellipse 20" class="pdp_logo_chat">
//                         </div>
//                         <div class="data_chat_bulle_wrapper">
//                             <div class="name_bulle_chat">${user.username}</div>
//                         </div>
//                     </div>
//                 </div>
//             `;
            
//             userContainer.innerHTML += userElementHTML;
//         });

//         // Add event listeners after rendering user elements
//         this.addUserClickListeners();
//     }

//     addUserClickListeners() {
//         const userElements = this.querySelectorAll('.chat_bulles_wrapper');

//         userElements.forEach(userElement => {
//             userElement.addEventListener('click', () => {
//                 const receiverId = userElement.id; // Get the ID of the clicked user
//                 const senderId = this.user.id; // Assuming logged-in user's ID
//                 this.receiverId = receiverId; // Set the receiverId
//                 this.fetchChatData(senderId, receiverId); // Fetch conversation for selected user
//                 this.querySelector(".name_user_con").innerHTML = userElement.getAttribute("name");
//                 this.querySelector(".second_section_wrapper_chat").style.display = 'block'; // Ensure the chat section is visible
//             });
//         });
//     }

//     displayMessages(messages) {
//         this.chatContainer = this.querySelector('.slots_messages_container__');
//         this.chatContainer.innerHTML = ''; // Clear previous messages
    
//         messages.forEach(message => {
//             let messageHTML = '';
//             if (message.sender === this.user.id) {
//                 // Logged-in user's messages
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
//                 // Selected user's messages
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
//     }

//     async sendMessage() {
//         if (!this.receiverId) {
//             console.error('No receiver selected');
//             this.clearChatArea(); // Clear chat area if no receiver is selected
//             return;
//         }

//         const messageContent = document.querySelector('.message-input').value;
//         const messageData = {
//             sender: this.user.id, // Assuming this.user has sender's ID
//             receiver: this.receiverId, // Set the receiverId
//             message: messageContent,
//             timestamp: new Date().toISOString(), // Assuming timestamp is managed by backend
//         };

//         try {
//             const response = await fetch('http://localhost:8000/chat/messages/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${this.token}` // Assuming token is stored in localStorage
//                 },
//                 body: JSON.stringify(messageData),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 console.log('Message saved:', data);
//                 document.querySelector('.message-input').value = ''; // Clear input field
//                 this.fetchChatData(this.user.id, this.receiverId); // Refresh messages after sending
//             } else {
//                 console.error('Error saving message:', response.statusText);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     clearChatArea() {
//         this.querySelector('.second_section_wrapper_chat').innerHTML = ''; // Clear chat section
//         this.querySelector('.second_section_wrapper_chat').style.display = 'none'; // Hide chat section
//     }

//     setupEventListeners() {
//         const sendButton = this.querySelector('.send-button');
    
//         sendButton.addEventListener('click', () => {
//             this.sendMessage();
//         });
//     }

//     render() {
//         this.innerHTML = /*html*/`
//             <div class="chat_wrapper_">
//                 <div class="first_section_wrapper_chat">
                    
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

//                                 </div>
//                             </div>
//                             <div class="input_conv_container__chat">
//                                 <input type="text" class="send_msg_input message-input" placeholder="Aa">
//                                 <button class="send-button">Send</button>
//                             </div>
//                         </div>
//                 </div>
//             </div>
//         `;

//         this.chatContainer = this.querySelector('.slots_messages_container__'); // Set chat container reference
//         this.userContainer = this.querySelector('.first_section_wrapper_chat'); // Set chat container reference

//         // Initially hide the chat section
//         this.querySelector('.second_section_wrapper_chat').style.display = 'none';
//     }
// }

// customElements.define("chat-page", Chat);
