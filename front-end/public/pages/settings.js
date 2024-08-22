import Http from "../http/http.js";

export default class Settings extends HTMLElement {
	constructor() {
		super();
		this.user = Http.user;
	}
	connectedCallback() {
		this.render();

		const lws = document.querySelectorAll('.link_wrapper_settings')
		let old_lws = lws[0];
		const content_ = document.querySelector(".content_")
		const forms = {
			'one': `
				<div>
				<h2 class="info_h">
					your infomations
				</h2>
				<p class="info_p">
					update your informations
				</p>
			</div>
				<div class="form_settings_wrapper_one">
					<div class="input_settings_wrapper">
						<lable class="label_txt" for="fullname">
							Full Name:
						</lable>
						<input type="text" name="fullname" id="fullname" class="fullname" value="${this.user.full_name}">
					</div>
					<div class="input_settings_wrapper">
						<lable class="label_txt" for="username">
							Username:
						</lable>
						<input type="text" name="username" id="username" class="username" value="${this.user.username}">
					</div>
					<div class="input_settings_wrapper">
						<lable class="label_txt" for="email">
							Email:
						</lable>
						<input type="email" name="email" id="email" class="email" value="${this.user.email}">
					</div>
					<div class="buttons_wrapper">
						<div class="submit_btn">
							<button type="submit" class="submit_infos">Update Info</button>
						</div>
					</div>
				</div>
				<h1 class="info_h">Blockes</h1>
				<div class="bolcked_users">
					<div class="blocked_users_list">
						<div>
							<h1 class="info_h">
								blocked users list
							</h1>
							<p class="info_p">
								view all blocked users
							</p>
						</div>
						<button class="view_blocked_users">
							View list
						</button>
					</div>
				</>
				`
			,

			'two': `

    <div class="players_info_ setting_1">
        <div class="player1">
            <div class="bold_txt_white">Paddle Theme</div>
            <paddle-option player="player1" class="player1_paddle"></paddle-option>
          </div>
    </div>
    <div class="game_theme setting_2">
        <div class="bold_txt_white">Table Theme</div>
        <div class="themes">
            <button id="classic" class="theme st"></button>
            <button id="mod" class="theme st selected_theme"></button>
            <button id="sky" class="theme st"></button>
        </div>
    </div>
    <div class="start_game_ setting_3">
      <button id="start_btn" disabled>Update Info</button>
    </div>
		`,
			'three': `
				<div class="bold_txt">
					Security Informations
				</div>
				<div class="form_settings_wrapper_one">
					<div class="input_settings_wrapper">
						<div class="label_txt">
							Old Password:
						</div>
						<input type="password" name="oldpass" id="oldpass" class="oldpass">
					</div>
					<div class="input_settings_wrapper">
						<div class="label_txt">
							New Password:
						</div>
						<input type="password" name="newpass" id="newpass" class="newpass">
					</div>
					<div class="input_settings_wrapper">
						<div class="label_txt">
							Confirm Password:
						</div>
						<input type="password" name="confirmpass" id="confirmpass" class="confirmpass">
					</div>
					<div class="buttons_wrapper">
						<div class="submit_btn">
							<button type="submit" class="submit_infos">Update Info</button>
						</div>
					</div>
				</div>
				<h1 class="info_h">
					2FA
				</h1>
				<div class="form_settings_wrapper_one">
					<div class="buttons_wrapper">
						<div class="submit_btn
						">
							${this.user.two_factor_auth ? "<button type='submit' class='submit_infos'>Disable 2FA</button>" : "<button type='submit' class='submit_infos'>Enable 2FA</button>"}
						</div>
					</div>
				</div>
				<h1 class="info_h">
					Delete Account
				</h1>
				<div class="form_settings_wrapper_one">
					<div class="buttons_wrapper">
						<div class="submit_btn
						">
							<button type="submit" class="submit_infos">Delete Account</button>
						</div>
					</div>
				</div>

		`
		}
		content_.innerHTML = forms['one']

		lws.forEach((e) => {
			e.addEventListener('click', () => {
				if (old_lws)
					old_lws.classList.remove('active_btn_settings')
				e.classList.add('active_btn_settings')

				for (let key in forms)
					if (e.classList[1] == key)
						content_.innerHTML = forms[key]

				old_lws = e;
			})
		})
		const submit_btn = document.querySelector('.submit_infos');
		const collectedSettingsData = {};


		submit_btn.addEventListener('click', () => {
			collectedSettingsData["full_name"] = document.querySelector('.fullname').value ?? null;
			collectedSettingsData["username"] = document.querySelector('.username').value ?? null;
			collectedSettingsData["email"] = document.querySelector('.email').value ?? null;

			const baseUrl = "http://localhost:8000"
			const endPoint = "/api/user/update/"
			const rs = fetch(baseUrl + endPoint, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.token}`
				},
				credentials: 'include',
				body: JSON.stringify({ collectedSettingsData }),
			}).then(response => {
				return response.json();
			}).then(data => {
				console.log(data)
			})
		})
	}
	render() {
		this.innerHTML = /*html*/ `
<div class="setting_wrapper_">
	<div class="left_side_settings_wrapper">
		<div class="infos_wrapper">
			<div class="img_wrapper">
				<img src='http://localhost:8000${this.user.profile_pic}' alt="img user" class="img_user_settings" loading="lazy">
				<i class="fa fa-edit"></i>
			</div>
			<div class="infos_details_wrapper">
				<div class="bold_txt">
					${this.user.fullname}
				</div>
				<div class="under_txt">
					Art Director
				</div>
			</div>
		</div>
		<div class="links_wrapper_swapper">
			<div class="link_wrapper_settings one active_btn_settings">
				<i class="fa fa-user"></i>
				<span class="txt___sett">
					General Information
				</span>
			</div>
			<div class="link_wrapper_settings two">
				<i class="fa-solid fa-game-console-handheld"></i>
				<span class="txt___sett">
					Game
				</span>
			</div>
			<div class="link_wrapper_settings three">
				<i class="fa-solid fa-lock"></i>
				<span class="txt___sett">
					Security
				</span>
			</div>

		</div>
	</div>
	<div class="right_side_settings_wrapper">
		<div class="marg_wrapper">
			<h1 class="setting_h">Settings</h1>
			<div class="content_">
			</div>
		</div>
	</div>
</div>
`;
	}

}

customElements.define("settings-page", Settings);
