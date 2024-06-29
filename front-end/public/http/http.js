import Observer from "../state/observer.js";

class Http {
  constructor() {
    this.baseUrl = "http://localhost:8000";
    this.user = null;
    this.website_stats = new Observer();
  }

  async register(data, url) {
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
  }

  async login(data, url) {
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
      return res;
    } else {
      res = await response.json();
      return res;
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
        console.log(response);
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
    const response = await fetch(`${this.baseUrl}/api/token/refresh/`, {
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
  }

  async verifyToken(trials = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/api/token/verify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status === 200) {
        const res = await response.json();
        this.user = res.user;
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
