export default class Auth {
	constructor() {
		this.baseUrl = 'http://localhost:8000';
	}

	async login(data) {
		const response = await fetch(`${this.baseUrl}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		return response.json();
	}

	async register(data) {
		const response = await fetch(`${this.baseUrl}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		return response.json();
	}
}
