
class pageTemplate extends HTMLElement {
    constructor() {
      super();
      this.shadow = this.attachShadow({mode: 'open'});
    }
      connectedCallback() {
          this.render();
      }
    render() {
      this.shadow.innerHTML = `
        <link rel="stylesheet" href="../css/style.css">
        <div class="signin-singup-div">
        </div>
      `;
    }
  }
  
  customElements.define('page-template', pageTemplate);
