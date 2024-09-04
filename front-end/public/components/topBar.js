import Link from "./link.js";

export default class TopBar extends HTMLElement {
  constructor() {
    super();
    this.welcome = false;
    this.boundCheckAndRender = this.checkAndRender.bind(this);
  }

  connectedCallback() {
    this.checkAndRender();
  }

  checkAndRender() {
    const path = window.location.pathname;
    this.initURLChangeDetection();
    if (path === "/" || path.startsWith("/auth") || path.startsWith("/game"))
      this.innerHTML = "";
    else
      this.render();
    if (path === "/dashboard")
      this.welcome = true;
    else
      this.welcome = false;
    const search_chat = document.querySelector('.search_chat');
    // get users\
    function count_data_include_search(e, data)
    {
      let count = 0;
      for (let user in data) 
      {
        if (data[user].username.includes(e)) {
          count++;
        }
      }
      return (count);
    }
    if (search_chat)
    {
      search_chat.addEventListener('input', (e) => {
        const card = document.querySelector(".search_wrapper_");

          e.preventDefault();
          fetch(`${ips.baseUrl}/api/user/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
          })
            .then((response) => response.json())
            .then((data) => {

              card.innerHTML = "";
              let counter = 0;
              let count_data = count_data_include_search(e.target.value, data);
              let border_ = "";
              
              for (let user in data) {

                border_ = "border-bottom: none!important"
                if (e.target.value && data[user].username.includes(e.target.value))
                {
                    counter++;
                    card.classList.add('active')
                    card.innerHTML += `<a is="co-link" href="/dashboard/profile/${data[user].username}" class="search_warpper_card" style="${border_}">
                    <img src=${data[user].profile_pic} width="200" class="img_user_search"/> <br>    
                    <div class="infos_user_search_wrapper">
                      <div class="username_search_wrapper" style="padding:4px 0px;">${data[user].username}</div>
                      <div class="email_search_wrapper" style="padding:4px 0px;">${data[user].email}</div>
                    </div>
                  </a>`;
                  // if (count_data > 1 && counter % 2 == 0)
                  //   {
                  //     console.log("The counter => ", counter)
                  //     card.innerHTML += "<hr/>"
                  //   }
                }
                else if (e.target.value == "" || count_data == 0)
                    card.classList.remove('active')
              }
            })
            .catch((error) => {
              console.error("Error in users list:", error);
            });
            if (e.target.value == "")
            {
              card.innerHTML = "";
              card.classList.remove('active')
            }

      });
    }
  }

  initURLChangeDetection() {
    // Listen for popstate, hashchange, and custom locationchange events
    window.removeEventListener("locationchange", this.boundCheckAndRender);
    window.addEventListener("locationchange", this.boundCheckAndRender);
  }

  render() {
    this.innerHTML = /*HTML*/ `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
    .active{
      display: block!important;
    }
  .search_warpper_card:hover{
    background-color: black!important;
    border-radius: 15px;
  }
  .search_wrapper_{
      backdrop-filter: blur(10px);
      background-color: transparent;
      // border: 1px solid #778FB8;
      border-radius: 15px;
      width: 350px;
      margin: 15px 0;
      font-family: "Poppins", sans-serif;
      font-weight: 400;
      font-style: normal;
  }
  .search_warpper_card {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #a4a4a4;
      transition: all 0.5s ease-in-out;
  }

  .search_warpper_card:focus-within {
transform: scale(1.1);
}
  img.img_user_search {
      width: 50px;
      border-radius: 60%;
      margin: 0 15px;
  }

  .infos_user_search_wrapper {
      color: white;
  }

  .username_search_wrapper {
      font-size: 15px;
      font-weight: bold;
  }

  .email_search_wrapper {
      font-size: 10px;
  }

 @keyframes slideDown {
0% {
    transform: translateY(-10%);
}
100% {
    transform: translateY(0);
}
}
@keyframes fadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
.search_wrapper_ {
  animation: fadeIn 0.1s ease-in-out forwards;
  display:none;
  border: none;
  z-index: 9999;
  position: absolute;

}
</style>
        <div class="chat_notification_bar_wrapper">
        ${this.welcome ? "<h1></h1>" : "<h1 id='welcoming'></h1>"}
        <div>
                <div class="search_input_wrapper">
                    <input type="text" name="search" id="search_chat" class="search_chat"
                        placeholder="Search Everything">
                    <div class="search_wrapper_">
                    </div>
                </div>
                <notification-icon></notification-icon>
            </div>
            </div>
        `;
  }
}

customElements.define("top-bar", TopBar);
