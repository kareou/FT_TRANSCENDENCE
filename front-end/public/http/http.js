import Observer from "../state/observer.js";
import Link from "../components/link.js";
import {ips} from "./ip.js";

class Http {
  constructor() {
    this.baseUrl = ips.baseUrl;
    this.user = null;
    this.website_stats = new Observer();
    this.notification_socket = null;
  }

  notifyStats(data) {
    console.log(data);
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
        this.website_stats.notify("status_update", data);
      }
    }
    else if (data.type === "remove_friend") {
      this.website_stats.notify("remove_friend", data);
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
      if (response.status !== 201) {
        const res = await response.json();
        return res;
      }
      const res = await response.json();
      return res;
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
      if (response.status === 200) {
        const res = await response.json();
        this.user = res.user;
        this.openSocket();
        return res;
      } else {
        res = await response.json();
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
      if (response.status === 200) {
        console.log("response.status");
        this.notification_socket.close(3001);
        console.log("response.status");
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
        body: method === "POST" ? JSON.stringify(data) : null,
      });
      if (response.status === 200) {
        const res = await response.json();
        return res;
      } else if (response.status === 401 && retries < 1) {
        await this.refreshToken();
        return this.getData(method, url, data, retries + 1);
      } else{
        const res = await response.json();
        return { error: res };
      };
    } catch (e) {
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
      if (response.status === 200) {
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
      if (response.status === 200) {
        const res = await response.json();
        this.user = res.user;
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
