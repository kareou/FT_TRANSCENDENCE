import Http from "../http/http.js";

export default class Settings extends HTMLElement {
	constructor() {
		super();
		this.user = Http.user;
	}
	connectedCallback() {
		console.log(this.user)
		this.render();

		const lws = document.querySelectorAll('.link_wrapper_settings')
		let old_lws = lws[0];
		const content_ = document.querySelector(".content_")
		let key_obj = null;
		const set = document.querySelectorAll('.set')


		lws.forEach((e, idx_btn) => {
			e.addEventListener('click', () => {
				if (old_lws)
					old_lws.classList.remove('active_btn_settings')
				e.classList.add('active_btn_settings')

				set.forEach((e, idx) => {
					if (idx != idx_btn)
						e.classList.add('d-none')
					else
						e.classList.remove('d-none')
				})
				console.log(key_obj)

				old_lws = e;
			})
		})
		const submit_btn = document.querySelector('.submit_infos');
		const collectedSettingsData = {};
		const btn_confirm = document.querySelector('.btn_confirm');
		const modal_wrapper_pass = document.querySelector('.modal_wrapper_pass');

		submit_btn.addEventListener('click', () => {
			modal_wrapper_pass.style.display = "block";
			const overlay_pass = document.querySelector('.overlay_pass');
			const modal_content_wrapper = document.querySelector('.modal_content_wrapper');
			overlay_pass.addEventListener('click', () => {
				modal_wrapper_pass.style.display = "none";
			})
		})

		btn_confirm.addEventListener('click', () => {
			collectedSettingsData["full_name"] = document.querySelector('.fullname').value ?? null;
			collectedSettingsData["username"] = document.querySelector('.username').value ?? null;
			collectedSettingsData["email"] = document.querySelector('.email').value ?? null;
			collectedSettingsData["password"] = document.querySelector('.pass').value ?? null;
			console.log(JSON.stringify(collectedSettingsData))

			const baseUrl = "http://localhost:8000"
			const endPoint = "/api/user/update/"
			const rs = fetch(baseUrl + endPoint, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(collectedSettingsData),
			}).then(response => {
				return response.json();
			}).then(data => {
				console.log(data)
				console.log(collectedSettingsData)
			})
		})

		const update_pass = document.querySelector('.update_pass');
		const collectedPassData = {};
		collectedPassData["old_password"] = document.querySelector('.oldpass').value ?? null;
		collectedPassData["new_password"] = document.querySelector('.newpass').value ?? null;
		collectedPassData["confirm_password"] = document.querySelector('.confirmpass').value ?? null;

		update_pass.addEventListener('click', () => {

			const dataPs = {}
			dataPs["old_password"] = document.querySelector('.oldpass').value
			dataPs["password"] = document.querySelector('.newpass').value
			if (document.querySelector('.newpass').value != document.querySelector('.confirmpass').value)
				return alert("Passwords do not match");
			const baseUrl = "http://localhost:8000"
			const endPoint = "/api/user/change_password/"
			const rs = fetch(baseUrl + endPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(dataPs),
			}).then(response => {
				return response.json();
			}).then(data => {
				console.log(data)
				console.log(dataPs)
			})
		});

		const enable_2fa = document.querySelector('.enable_2fa');
		const disable_2fa = document.querySelector('.disable_2fa');
		const qr = document.querySelector('._2fa_qrcode');

		Http.getData("/api/user/" + this.user.username).then(data => {
			console.log(data)
		})
		const _2fa_container = document.querySelector('._2fa_container');
		const modal_wrapper_2fa = document.querySelector('.modal_wrapper_2fa');
		enable_2fa.addEventListener('click', () => {
			const baseUrl = "http://localhost:8000"
			const endPoint = "/api/user/enable_2fa/"
			const rs = fetch(baseUrl + endPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			}).then(response => {
				return response.json();
			}).then(data => {
				_2fa_container.style.display = "block";
				modal_wrapper_2fa.style.display = "block";
				qr.src = data["2fa_url"]

				console.log(data["2fa_url"])
				enable_2fa.style.display = "none";
				disable_2fa.style.display = "block";
			})
		})

		disable_2fa.addEventListener('click', () => {
			const baseUrl = "http://localhost:8000"
			const endPoint = "/api/user/disable_2fa/"
			const rs = fetch(baseUrl + endPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			}).then(response => {
				return response.json();
			}).then(data => {
				console.log(data)
				enable_2fa.style.display = "block";
				disable_2fa.style.display = "none";
			})
		})


		if (this.user._2fa_enabled) {
			enable_2fa.style.display = "none";
			disable_2fa.style.display = "block";


		}
		else {
			enable_2fa.style.display = "block";
			disable_2fa.style.display = "none";
		}




	}
	render() {

		this.innerHTML = /*html*/ `
		<style>
			._2fa_qrcode{
				width: 100%;
			}
		._2fa_container{
		  display: none;
		}
		.modal_wrapper_2fa {
			  display: none;
			  position: fixed;
			  top: 0;
			  left: 0;
			  width: 100%;
			  height: 100%;
			  z-index: 1000;
			  backdrop-filter: blur(10px);
		  }
  
		  .overlay_2fa,
		  .overlay_pass {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(23, 16, 24, 0.9);
	border-radius: 15px;
	border: 1px solid white;
		  }
		  ._pass_container{
			display: flex;
			flex-direction: column;
		  }
		  .modal_content_wrapper {
			  position: absolute;
			  top: 50%;
			  left: 50%;
			  transform: translate(-50%, -50%);
			  width: 600px;
			  height: 400px;
			  border-radius: 10px;
			  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
			  overflow: hidden;
			  background-image: linear-gradient(190deg, rgb(0, 0, 0) 10%, rgb(0, 0, 0) 34%, rgb(0, 0, 0) 38%, rgb(62, 7, 76) 100%);
			  border: 0.6px solid white;
  
		  }
		  ._2fa__wrapper{
			height: fit-content;
			padding: 25px;
		  }

		  ._pass__wrapper{
			height: fit-content;
			width: fit-content;
			padding: 20px;
		  }
		  .pass_in_wrapper{
			width: 300px;
			height: 45px;
		  }


		  .text_wrapper{
			font-size: 19px;
color: white;
font-weight: bold;
padding: 10px 0;		}
		.btn_confirm
		{
			width: 100%;
background: #2e6db1;
padding: 10px 0px;
border: none;
font-size: 18px;
color: white;
font-weight: bold;
border-radius: 7px;
margin: 15px 0;
		}

		._pass__wrapper {
height: fit-content;
width: fit-content;
padding: 20px;

}

.pass_in_wrapper {
width: 373px;
height: 35px;
}
.modal_wrapper_pass{
	display: none;
}
		</style>
	<div class="setting_wrapper_">
		<div class="left_side_settings_wrapper">
			<div class="infos_wrapper">
				<div class="img_wrapper">
					<img src='http://localhost:8000${this.user.profile_pic}' alt="img user" class="img_user_settings"
						loading="lazy">
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
				<div class="content_">
					<div class="one set">
				<h1 class="setting_h">General Informations</h1>

						<div class="form_settings_wrapper_one">
							<div class="input_settings_wrapper">
								<lable class="label_txt" for="fullname">
									Full Name:
								</lable>
								<input type="text" name="fullname" id="fullname" class="fullname"
									value="${this.user.full_name}">
							</div>
							<div class="input_settings_wrapper">
								<lable class="label_txt" for="username">
									Username:
								</lable>
								<input type="text" name="username" id="username" class="username"
									value="${this.user.username}">
							</div>
							<div class="input_settings_wrapper">
								<lable class="label_txt" for="email">
									Email:
								</lable>
								<input type="email" name="email" id="email" class="email" value="${this.user.email}">
							</div>
							<!-- <div class="input_settings_wrapper">
								<div class="label_txt">
									What's your Password:
								</div>
								<input type="password" name="pass" id="pass" class="pass">
							</div> -->

							<div class="modal_wrapper_pass">
								<div class="overlay_pass"></div>
								<div class="modal_content_wrapper _pass__wrapper">
								<div class="_pass_container">
									<div class="label_txt text_wrapper">
										Password:
									</div>
									<input type="password" name="pass" id="pass" class="pass pass_in_wrapper">
									<div> <button class="btn_confirm">Confirm</button></div>
							  </div>
								</div>
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
						</div>


					</div>
					<div class="two set d-none">
					<h1 class="setting_h">Game Settings</h1>
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
					</div>
					<div class="three set d-none">
						<h1 class="setting_h">
							Security Informations
						</h1>
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
									<button type="submit" class="submit_infos update_pass">Update Info</button>
								</div>
							</div>
						</div>
						<h1 class="info_h">
							Two Factor Authentication
						</h1>
						<button type="button" class="enable_2fa">Activate 2FA</button>
						<button type="button" class="disable_2fa">Desactivate 2FA</button>
						<div class="modal_wrapper_2fa">
						<div class="overlay_2fa"></div>
						<div class="modal_content_wrapper _2fa__wrapper">
						<div class="_2fa_container">
						<label for="otp">2FA QR CODE</label>
							${this.user._2fa_enabled ? `<img src="http://localhost:8000/media/2fa/${Http.user.username}_2fa.png" alt="2fa qr code" class="_2fa_qrcode">` : "<img src='' alt='2fa qr code' class='_2fa_qrcode'>"}
					  </div>
						</div>
					</div>
					  </div>
				
					</div>
				</div>
			</div>
		</div>
		`;
	}

}

customElements.define("settings-page", Settings);