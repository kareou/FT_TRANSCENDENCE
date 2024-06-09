

class Http {
	constructor() {
		this.baseUrl = 'http://localhost:8000';
		this.user = null;
	}

	async register(data, url) {
		const response = await fetch(`${this.baseUrl}/${url}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		res = await response.json();
		return res;
	}

	async login(data, url) {
		const response = await fetch(`${this.baseUrl}/${url}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (response.status === 200) {
			const res = await response.json();
			localStorage.setItem('token', res.token);
			localStorage.setItem('refreshToken', res.refresh_token);
			this.user = res.user;
			return res;
		}
		else {
			console.log(response);
			res = await response.json();
			return res;
		}
	}

	async getData(method, url, data = null, retries = 0) {
		const response = await fetch(`${this.baseUrl}/${url}`, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
			},
			body: method === 'POST' ? JSON.stringify(data) : null,
		});
		if (response.status === 200) {
			const res = await response.json();
			return res;
		}
		else if (response.status === 401 && retries < 1) {
			console.log(localStorage.getItem('token'));
			await this.refreshToken();
			console.log(localStorage.getItem('token'));
			return this.getData(method, url, data, retries + 1);
		}
		else
			return response.json();
	}


	async refreshToken() {
		const token = localStorage.getItem('token');
		const refreshToken = localStorage.getItem('refreshToken');
		fetch(`${this.baseUrl}/api/token/refresh/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refresh: refreshToken}),
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				localStorage.setItem('token', res.token);
				return res;
			});
	}
}

Http = new Http();
export default Http;
