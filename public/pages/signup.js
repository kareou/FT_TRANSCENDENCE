export default class SignUp extends HTMLElement {
  constructor() {
    super();
    document.title = "signup";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
        <div id="signup" class="container">
            <div class="container_form">
                <h1 class="welcome-text">Create your account</h1>
                <label for="name">Name</label>
                <input type="text" name="name" id="name" placeholder="Enter your name" required>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder="Enter your email" required>
                <label for="password">Password</label>
                <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
                <a href="/signup" class="signUpButton">Sign up</a>
                <p>Already have an account?<button class="signInLink" onclick="changeRoute('signin')">&nbsp&nbsp Sign In</button></p>
            </div>
        </div>
        `;
  }
}

customElements.define("sign-up", SignUp);
