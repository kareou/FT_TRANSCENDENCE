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
    <div id="signin" class="container">
    <div class="container_form">
        <h1 class="welcome-text">Welcome back</h1>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" placeholder="Enter your email" required>
        <label for="password">Password</label>
        <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
        <a href="/signin" class="signInButton">Sign In</a>
        <a href="/intraSignin" class="signInButton"><img src="images/42_logo.svg" alt="42 logo" class="intra_logo"> Sign In with Intra</a>
        <p> Don't have an account yet ? <button class="signUpLink" onclick="changeRoute('signup')">&nbsp&nbsp Sign Up</button></p>
    </div>
</div>
        `;
  }
}

customElements.define("sign-in", SignIn);