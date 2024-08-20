class pageTemplate extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
    }
    render() {
      this.innerHTML = `
        <link rel="stylesheet" href="../css/style.css">
        <div class="signin-singup-div">
        <sign-in></sign-in>
        <sign-up></sign-up>
        </div>
        `;
    }
}

customElements.define('page-template', pageTemplate);



class signin extends HTMLElement {
    constructor() {
        super();
        // this.shadow = this.attachShadow({mode: 'open'});
    }
        connectedCallback() {
            this.render();
        }
    render() {
        this.innerHTML = `
        <link rel="stylesheet" href="../css/style.css">
        <div id="signin" class="container">
            <div class="container_form">
                <h1 class="welcome-text">Welcome back</h1>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder="Enter your email" required>
                <label for="password">Password</label>
                <input type="password" name="pwd" id="pwd" placeholder="Enter your password" required>
                <a href="/signin" class="signInButton">Sign In</a>
                <a href="/intraSignin" class="signInButton"><img src="images/42_logo.svg" alt="42 logo" class="intra_logo" loading="lazy"/> Sign In with Intra</a>
                <p> Don't have an account yet ? <button class="signUpLink" onclick="changeRoute('signup')">&nbsp&nbsp Sign Up</button></p>
            </div>
        </div>
        `;
    }
}
  
customElements.define('sign-in', signin);


class signup extends HTMLElement {
    constructor() {
        super();
        // this.shadow = this.attachShadow({mode: 'open'});
    }
        connectedCallback() {
            this.render();
        }
    render() {
        this.innerHTML = `
        <link rel="stylesheet" href="../css/style.css">
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
  
customElements.define('sign-up', signup);