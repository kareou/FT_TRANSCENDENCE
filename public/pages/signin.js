export default class SignIn extends HTMLElement {
  constructor() {
    super();
    document.title = "signin";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = /*HTML*/ `
      <div id="signin" class="container sign_in_up">
        <form class="container_form" action>
            <h1 class="welcome-text">Welcome back</h1>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" placeholder="Enter your email" required>
            <label for="password">Password</label>
            <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
            <button class="signInButton">Sign In</button>
            <button class="signInButton"><img src="images/42_logo.svg" alt="42 logo" class="intra_logo"> Sign In with Intra</button>
            <p> Don't have an account yet ? <a is="co-link" href="/signup" class="signUpLink" >Sign Up</a></p>
        </form>
      </div>
        `;
  }
}

customElements.define("sign-in", SignIn);
