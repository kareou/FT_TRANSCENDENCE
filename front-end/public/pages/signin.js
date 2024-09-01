import Link from "../components/link.js";
import Http from "../http/http.js";
import { ips } from "../http/ip.js";

export default class SignIn extends HTMLElement {
  constructor() {
    super();
    document.title = "signin";
  }

  connectedCallback() {
    this.render();

    const signInButton = this.querySelector(".intra_login");
    const otp_container = this.querySelector(".otp_container");
    const modal_wrapper_otp = this.querySelector(".modal_wrapper_otp");
    signInButton.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        window.location.replace(`${ips.baseUrl}/api/user/oauth2/authorize/412/`);
      } catch (error) {
        console.log(error);
      }
      Http.getData("GET", "api/user/oauth2/authorize/42/").then((res) => {
        Http.user = res.user;
        console.log(res);
      });
      Http.openSocket();
      Http.notification_socket.send(
        JSON.stringify({
          type: "status_update",
          sender: Http.user.id,
          message: "offline",
          receiver: 0,
        })
      );
    });
    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = this.querySelector("#email").value;
      const pwd = this.querySelector("#pwd").value;
      const data = {
        email: email,
        password: pwd,
      };
      Http.login(data, "api/user/login/").then((res) => {
        if (res.message == "'otp'") {
          otp_container.style.display = "block";
          modal_wrapper_otp.style.display = "block";
          otp_container.querySelector("#otp_input").required = true;
          otp_container
            .querySelector("#otp_input")
            .addEventListener("input", (e) => {
              if (e.target.value.length == 6) {
                data["otp"] = e.target.value;
                Http.login(data, "api/user/login/").then((res) => {
                  if (res.user) {
                    Link.navigateTo("/dashboard");
                  }
                });
              }
            });
        }
        if (res.user) {
          Link.navigateTo("/dashboard");
        }
      });
    });
  }

  render() {
    this.innerHTML = /*HTML*/ `
    <style>
      .otp_container{
        display: none;
      }
      .modal_wrapper_otp {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }

        .overlay_otp {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(155, 155, 155, 0.1);
  border-radius: 29px;
  border: 1px solid white;
        }

        .modal_content_wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 400px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            background-image: linear-gradient(190deg, rgb(0, 0, 0) 10%, rgb(0, 0, 0) 34%, rgb(0, 0, 0) 38%, rgb(62, 7, 76) 100%);
            border: 0.6px solid white;

        }
        .otp__wrapper{
          height: fit-content;
          padding: 25px;
        }
      </style>
      <div id="signin" class="container sign_in_up">
        <form class="container_form" action="localhost:8000/api/user/login/">
            <h1 class="welcome-text">Welcome back</h1>
            <div class="modal_wrapper_otp">
            <div class="overlay_otp"></div>
            <div class="modal_content_wrapper otp__wrapper">
            <div class="otp_container">
            <label for="otp">OTP code</label>

            <input type="text" name="otp" id="otp_input" class="otp_input" placeholder="Enter your OTP" style="margin: 15px 0;">
          </div>
            </div>
        </div>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" placeholder="Enter your email" required>
            <label for="password">Password</label>
            <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>

            <button type="submit" class="signInButton" >login</button>
            <button class="signInButton intra_login"><img src="https://profile.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg" alt="42 logo" class="intra_logo"> Sign In with Intra</button>
            <p> Don't have an account yet ? <a is="co-link" href="/auth/register" class="signUpLink" >Sign Up</a></p>
        </form>
      </div>
        `;
  }
}

customElements.define("sign-in", SignIn);
