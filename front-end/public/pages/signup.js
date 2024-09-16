import Http from "../http/http.js";

export default class SignUp extends HTMLElement {
  constructor() {
    super();
    document.title = "signup";
  }

  connectedCallback() {
    this.render();
    let username_checker = true;



    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const value = this.querySelector("#username").value;
  
      if (!this.isAlphanumeric(value) && value !== "") {
        Http.website_stats.notify("toast", {type: "error", message: "username can contain only letters and numbers"});
        username_checker = false;
      }

      if (username_checker)
      {
        const username = this.escapeHTML(this.querySelector("#username").value);
        const full_name = this.escapeHTML(this.querySelector("#full_name").value);
        const email = this.escapeHTML(this.querySelector("#email").value);
        const pwd = this.escapeHTML(this.querySelector("#pwd").value);
        const data = {
          username: username,
          full_name: full_name,
          email: email,
          password: pwd,
        };
  
        Http.register(data,"api/user/register/").then((res) => {
          console.log(res);
        });
      }
    });

  }
  escapeHTML(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  isAlphanumeric(input) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(input);
}

render() {
        this.innerHTML = /*HTML*/ `
  <div id="signup" class="container sign_in_up">
      <form action="" class="container_form">
        <h1 class="welcome-text">Create your account</h1>
        <label for="username">username</label>
        <input type="text" name="username" id="username" placeholder="Enter your name" required>
        <label for="full_name">full name</label>
        <input type="text" name="full_name" id="full_name" placeholder="Enter your name" required>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" placeholder="Enter your email" required>
        <label for="password">Password</label>
        <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
        <button  class="signUpButton" type="submit">Sign up</button>
        <p>Already have an account? <a is="co-link" href="/auth/login" class="signInLink">Sign In</a></p>
      </form>
  </div>
`;
}

}

customElements.define("sign-up", SignUp);
