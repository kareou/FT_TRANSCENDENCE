import Http from "../http/http.js";

export default class ProfileInfo extends HTMLElement {
  constructor() {
    super();
    this.user = Http.user;
    this.id = this.getAttribute("id");
    this.websocket = null;
  }
  connectedCallback() {
    if (this.id != this.user.username) {
      Http.getData("Get",`api/user/${this.id}`).then((data) => {
        this.user = data;
        this.render();
        this.markUnearnedAchievements();
        this.setupEventListeners();
      });
    }
    else{
      this.render();
      this.markUnearnedAchievements();
      this.setupEventListeners();
    }
  }

  markUnearnedAchievements() {
    const achievements = document.querySelectorAll(".achievement_list img");
    for (let i = 0; i < this.user.level; i++) {
      achievements[i].classList.add("earned");
    }
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
setupWebSocket() {
  this.websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${Http.user.id}/${this.user.id}/`);

  this.websocket.addEventListener("open", function (event) {
      console.log("WebSocket connection opened.");
  });

  this.websocket.addEventListener("close", function (event) {
      console.log("WebSocket connection closed.");
  });
}
h

async sendMessage() {
  try {
    let conversation = await this.fetchOrCreateConversation(Http.user.id, this.user.id);
    
    const messageContent = document.querySelector('.message-input').value;
    const messageData = {
      sender: Http.user.id,
      message: messageContent,
      timestamp: new Date().toISOString(),
      conversation: conversation.id
    };
    
    this.setupWebSocket();
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
      console.log('Message saved:', data);
      this.websocket.send(JSON.stringify(dataWs));
      document.querySelector('.message-input').value = '';
    } else {
      const errorData = await response.json();
      console.error('Error saving message:', errorData.detail || response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

  setupEventListeners()
  {
    const buttonNew = document.querySelector('.new-msg');
    const buttonClose = document.querySelector('.close-btn');
    const msgPrompt = document.querySelector('.msg-prompt');
    const buttonSend = document.querySelector('.send-button');

    
    buttonNew.addEventListener('click', () => {
      console.log("button message pressed");
        if (msgPrompt.classList.contains('hidden')) {
            msgPrompt.classList.remove('hidden');
            msgPrompt.classList.add('visible');
        } else {
            msgPrompt.classList.remove('visible');
            msgPrompt.classList.add('hidden');
        }
    });

    buttonClose.addEventListener('click', () => {
      console.log("button close pressed");

      msgPrompt.classList.remove('visible');
      msgPrompt.classList.add('hidden');
    });

    buttonSend.addEventListener('click', () => {
      this.sendMessage();
      buttonClose.click();
    });
  }
  render() {
    this.innerHTML = /*HTML*/ `
        <div class="profile" >
          <div class="profile_img">
            <img src='http://localhost:8000${this.user.profile_pic}' class="profile_img" alt="profile">
          </div>
          <div class="profile_info">
            <div class="infos">
              <div class="name_n_login">
                <h1 id="user_name">${this.user.full_name}</h1>
                <h6 id="login">${this.user.username}</h6>
              </div>
              <h2>
              <span>
              <i class="fa-sharp fa-light fa-coins" style="color: #04BF8A;"></i>
              </span>
              <span id="user_coins">2300$
              </span>
              </h2>
            </div>
            <div class="">
              <button class="new-msg">Message</button>
            </div>
            <div class="achievement">
              <h1>Achievements</h1>
              <div class="achievement_list">
              <img src="/public/assets/ranks/1.png" alt="medal">
              <img src="/public/assets/ranks/2.png" alt="medal">
              <img src="/public/assets/ranks/3.png" alt="medal">
              <img src="/public/assets/ranks/4.png" alt="medal">
              <img src="/public/assets/ranks/5.png" alt="medal">
              <img src="/public/assets/ranks/6.png" alt="medal">
              <img src="/public/assets/ranks/7.png" alt="medal">
              </div>
              <h4 class="level">
                <span>${this.user.level}</span>
                <span>${this.user.exp}%</span>
              </h4>
              <div class="level-bar">
                <span style="width: ${this.user.exp}%;"></span>
              </div>
            </div>
          </div>
          <div class="msg-prompt hidden" >
            <div class="msg-prompt_sub1">
              <p>message to ${this.user.username}</p>
              <button class="close-btn">close</button>
            </div>
            <div class="msg-prompt_sub2">
              <input type="text" class="message-input">
              <button class="send-button">Send</button>
            </div>
          </div>
    </div>
    `;
  }
}

customElements.define("profile-info", ProfileInfo);
