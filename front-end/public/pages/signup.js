import Http from "../http/http.js";

export default class SignUp extends HTMLElement {
  constructor() {
    super();
    document.title = "signup";
  }

  connectedCallback() {
    this.render();
    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = this.querySelector("#username").value;
      const full_name = this.querySelector("#username").value;
      const email = this.querySelector("#email").value;
      const pwd = this.querySelector("#pwd").value;
      const data = {
        username: username,
        full_name: username,
        email: email,
        password: pwd,
      };
      Http.register(data,"api/user/register/").then((res) => {
        // if (res.token) {
        //   Link.navigateTo("/");
        // }
        console.log(res);
      });
    });
  }

render() {
        this.innerHTML = /*HTML*/ `
  <div id="signup" class="container sign_in_up">
      <form action="" class="container_form">
        <h1 class="welcome-text">Create your account</h1>
        <label for="username">username</label>
        <input type="text" name="username" id="username" placeholder="Enter your name" required>
        <label for="full_name">full_name</label>
        <input type="text" name="full_name" id="full_name" placeholder="Enter your name" required>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" placeholder="Enter your email" required>
        <label for="password">Password</label>
        <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
        <button  class="signUpButton" type="submit">Sign up</button>
        <p>Already have an account? <a is="co-link" href="/signin" class="signInLink">Sign In</a></p>
      </form>
  </div>
`;
}

}

customElements.define("sign-up", SignUp);
