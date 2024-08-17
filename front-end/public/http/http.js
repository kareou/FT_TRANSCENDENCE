import Observer from "../state/observer.js";

class Http {
  constructor() {
    this.baseUrl = "http://localhost:8000";
    this.user = null;
    this.website_stats = new Observer();
    this.notification_socket = null;
  }

  notifyStats(data) {
    console.log("test socket", data);
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
    this.notification_socket = new WebSocket(
      `ws://localhost:8000/ws/notification/${this.user.id}/`
    );
    this.notification_socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.notifyStats(data);
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
      if (response.status === 200) {
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
      } else return response.json();
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
        }else if(this.notification_socket.readyState === 3){
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
