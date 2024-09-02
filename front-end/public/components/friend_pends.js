import Http from "../http/http.js";

export default class FriendPends extends HTMLElement {
    constructor() {
        super();
        Http.website_stats.addObserver({update: this.update.bind(this), event: "friends"});
        Http.website_stats.addObserver({update: this.update.bind(this), event: "friend_request"});
    }

    update() {
        console.log("update");
        this.render();
        this.getRequests();
    }

    getRequests() {
        const fq_wrapper = document.querySelector(".friend_online_wrapper_requests")
        Http.getData("GET", "api/friends/accept/")
        .then (response =>{
            return (response)
        })
        .then(data => {
        for (let i = 0; i < data.length; i++) {
        const test = `<friend-request profile_pic="${data[i].user1.profile_pic}"  full_name="${data[i].user1.full_name}" user_id="${ data[i].user1.id}"></friend-request>`
        fq_wrapper.innerHTML += test
        }
        if (data["detail"] === "No friendList matches the given query.") {
        console.log("no friend requests")
        fq_wrapper.style.overflow = "hidden";
        fq_wrapper.innerHTML =
        `
        <h1 style="text-align: center;">you don't have any requests</h1>
        `
        fq_wrapper.classList.add("center_toggle")
        }
        })
        ;
    }

    connectedCallback() {
        this.render();
        this.getRequests();
    }

    render() {
        this.innerHTML = /*HTML*/ `
        <div class="rank fq">
            <div class="first" style="width: 100%;">
            <h1>Friends Requests</h1>
            <div class="friend_online_wrapper_requests" style="width: 100%;">
            </div>
            <!-- <div class="friend_online_wrapper" style="width: 100%;">
            </div> -->
            </div>

      </div>
        `;
    }

}

customElements.define("friend-pends", FriendPends);
