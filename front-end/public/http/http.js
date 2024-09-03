import Observer from "../state/observer.js";
import Link from "../components/link.js";
import {ips} from "./ip.js";

class Http {
  constructor() {
    this.baseUrl = ips.baseUrl;
    this.user = null;
    this.friends = {};
    this.website_stats = new Observer();
    this.tournament_data = null;
    this.notification_socket = null;
  }

  serializeFriends(friends) {
    friends.forEach((friend) => {
      if (friend.user1.id != this.user.id) {
          this.friends[friend.user1.id] = {...friend.user1, friendship_id: friend.id};

      }
      else{
          this.friends[friend.user2.id] = {...friend.user2, friendship_id: friend.id};
      }
    })
    console.log(this.friends.length);
  }

  async getFriends() {
    const data =  await this.getData("GET", "api/friends/")
    this.serializeFriends(data);
  }

  notifyStats(data) {
    if (data.type === "game_invite")
      this.website_stats.notify("toast", data);
    else if (data.type === "FRQ") {
      this.website_stats.notify("friend_request", data);
    }
    else if (data.type === "tournament_match") {
      setTimeout(() => {
        Link.navigateTo(`/game/online/?game_id=${data.message}`);
      }, 5000);
    }
    else if (data.type === "status_update") {
      if (data.user_id !== this.user.id) {
        this.friends[data.user_id].online = !this.friends[data.user_id].online;
        this.website_stats.notify("status_update", data);
      }
    }
    else if (data.type === "add_friend") {
      if (data.message.user1.id != this.user.id) {
          this.friends[data.message.user1.id] = {...data.message.user1, friendship_id: data.message.id};
      }
      else{
          this.friends[data.message.user2.id] = {...data.message.user2, friendship_id: data.message.id};
      }
      this.website_stats.notify("friends", data);
    }
    else if (data.type === "remove_friend") {
      delete this.friends[data.sender];
      this.website_stats.notify("remove_friend", data);
    }
    else if (data.type === "players_status_changed") {
      let current_location = window.location.pathname
       this.tournament_data = data.message;
      if ( current_location !== "/dashboard/tournament") {
        if(current_location !== "/game/online"){
          Link.navigateTo("/dashboard/tournament");
        }else {
          const interval = setInterval(() => {
            current_location = window.location.pathname;
            if (window.location.pathname === "/dashboard") {
              clearInterval(interval);
              Link.navigateTo("/dashboard/tournament");
            }
          }, 500);
        }
      }else{
        this.website_stats.notify("players_status_changed", this.tournament_data);
      }
    }
    else
      this.website_stats.notify("notification", data);
  }

  async register(data, url) {
    try {
      const response = await fetch(`${this.baseUrl}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      if (response.status !== 201) {
        Object.keys(res).forEach(key => {
          this.website_stats.notify("toast", { type: "error", message: key+" : "+res[key] });
        });
        return res;
      }
      else
      {
        this.website_stats.notify("toast", { type: "info", message: res.message });
        return res;
      }
    } catch (e) {
      return { error: e.message };
    }
  }

  openSocket() {
    console.log("Opening socket");
    this.notification_socket = new WebSocket(
      `${ips.socketUrl}/ws/notification/${this.user.id}/`
    );
    this.notification_socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.notifyStats(data);
    }
    this.notification_socket.onopen = () => {
      this.notification_socket.send(JSON.stringify({ type: "status_update", sender: this.user.id, message: "online", receiver: 0 }));
    }
  }

  async login(data, url) {
    try {
      const response = await fetch(`${this.baseUrl}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (response.ok) {
        const res = await response.json();
        this.user = res.user;
        await this.getFriends();
        this.openSocket();
        return res;
      } else {
        res = await response.json();
        this.website_stats.notify("toast", { type: "error", message: res.message });
        return res;
      }
    } catch (e) {
      return { error: e.message };
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log(response.status);
      if (response.ok) {
        this.notification_socket.close(3001);
        this.notification_socket = null;
        const res = await response.json();
        this.user = null;
        return res;
      } else {
        const res = await response.json();
        return res;
      }
    } catch (e) {
      return { error: e.message };
    }
  }

  async getData(method, url, data = null, retries = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/${url}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: (method === "POST" || method === "PUT") ? JSON.stringify(data) : null,
      });
      if (response.ok) {
        const res = await response.json();
        if (method === "POST" || method === "PUT")
          this.website_stats.notify("toast", { type: "success", message: res.message });
        return res;
      } else if (response.status === 401 && retries < 1) {
        await this.refreshToken();
        return this.getData(method, url, data, retries + 1);
      } else{
        const res = await response.json();
        if (method === "POST" || method === "PUT")
          this.website_stats.notify("toast", { type: "error", message: res.message });
        return { error: res };
      };
    } catch (e) {
      if (method === "POST" || method === "PUT")
        this.website_stats.notify("toast", { type: "error", message: e.message });
      return { error: e.message };
    }
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/api/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        const res = await response.json();
        return res;
      } else {
        const res = await response.json();
        return res;
      }
    } catch (e) {
      return { error: e.message };
    }
  }

  async verifyToken(trials = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/api/token/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        const res = await response.json();
        this.user = res.user;
        console.log(this.user);
        await this.getFriends();
        if (!this.notification_socket) {
          this.openSocket();
        } else if (this.notification_socket.readyState === 3) {
          this.openSocket();
        }
        return true;
      } else if (response.status === 401 && trials < 3) {
        const res = await response.json();
        await this.refreshToken();
        return this.verifyToken(trials + 1);
      } else {
        await this.refreshToken();
        if (trials < 1) return this.verifyToken(trials + 1);
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

Http = new Http();
export default Http;
