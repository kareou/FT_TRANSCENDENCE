export default class GameOption extends HTMLElement {
  constructor() {
    super();
    this.type = this.getAttribute("type");
    this.incId = this.getAttribute("incId");
    this.decId = this.getAttribute("decId");
    this.text = this.getAttribute("text");
    this.value = 5;
    this.maxscore = this.type === "Time" ? 10 : 7;
    this.minscore = this.type === "Time" ? 3 : 1;
  }

  connectedCallback() {
    this.render();
    document.addEventListener("click", (e) => {
      if (e.target.id === this.incId) {
        this.value++;
        this.render();
      } else if (e.target.id === this.decId) {
        this.value--;
        this.render();
      }
    }).bind(this);
  }

  render() {
    this.innerHTML = `
    <div class="game_option">
        <div class="game_option_title">
        <input type="checkbox" name="" id="">
        <label for="time">${this.text}</label>
        </div>
        <div class="game_option_content">
        <button id=${this.decId} ${this.value == this.minscore? 'disabled' : ''}>-</button>
        <p id="value">${this.#fixValue(this.value)}</p>
        <button id=${this.incId} ${this.value == this.maxscore? 'disabled' : ''}>+</button>
    </div>
    `;
  }

  #fixValue(value) {
    if (this.type === "Time") {
      return `${value} min`;
    } else {
        return value;
        }
  }
}

customElements.define("game-option", GameOption);