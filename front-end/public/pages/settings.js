import Http from "../http/http.js";

export default class Settings extends HTMLElement {
	constructor() {
		super();
		this.user = Http.user;
	}
	connectedCallback() {
		this.render();
	}
	render() {
		this.innerHTML = /*html*/`
		<div class="setting_wrapper">
		<div class="right_sidebar_wrapper">
			<div class="account_settings_wrapper">
				<h1 class="settings_title">Account Settings</h1>
				<div>
					<ul class="settings_menu">
						<li class="sidebar-item" data-target="profile-container">
							<p>Profile</p>
						</li>
						<li class="sidebar-item" data-target="security-container">
							<p>Security</p>
						</li>
						<li class="sidebar-item" data-target="notifications-container">
							<p>Notifications</p>
						</li>
					</ul>
				</div>
				<a class="delete-account">
					<p href="#">Delete Account</p>
				</a>
			</div>
		</div>
		<div id="content_wrapper" class="content_wrapper">
			<div id="profile-container" class="content-item profile-container active">
				<div>
					<p class="profile_title">My profile</p>
				</div>
				<div class="settings_profile">
					<img src="http://localhost:8000${this.user.profile_pic}" alt="Profile Picture" class="profile-picture">
					<div class="profile_info">
						<p class="name">${this.user.full_name}</p>
						<p class="username">${this.user.username}</p>
					</div>
					<button class="button_edit">Edit <i class="fa-light fa-pen-to-square"></i></button>
				</div>
				<div class="infos_container">
					<div class="infos_bar">
						<p>Personal Information</p>
						<button class="button_edit">Edit <i class="fa-light fa-pen-to-square"></i></button>
					</div>
					<div class="infos">
						<p>
							<label>First Name</label>
							<span>Othmane</span>
						</p>
						<p>
							<label>Last Name</label>
							<span>Guennach</span>
						</p>
						<p>
							<label>Email address</label>
							<span>${this.user.email}</span>
						</p>
						<p>
							<label>Phone</label>
							<span>212 67 674 645 77</span>
						</p>
					</div>

				</div>
				<div>
					<button class="button_save">Save</button>
				</div>
			</div>
			<div id="security-container" class="content-item security-container">
				<div>
					<p class="security_title">Security</p>
				</div>
			</div>
			<div id="notifications-container" class=" content-item notifications-container">
				<div>
					<p class="notifications_title">Notifications</p>
				</div>
			</div>
		</div>
	</div>
`
	}
}

customElements.define('settings-page', Settings);
