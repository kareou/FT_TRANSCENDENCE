export default class ThemeSelector extends HTMLElement {
    constructor() {
        super();
        this.theme_name = this.getAttribute('theme_name');
        this.theme_image = this.getAttribute('theme_image');
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <div class="board_theme">
            <div class="theme_name">
                <h1>${this.theme_name}</h1>
                <i class="fa-duotone fa-square-info"></i>
            </div>
            <div class="theme_preview">
                <div class="theme_preview_board">
                    <img src="${this.theme_image}" alt="">
                </div>
            </div>
        </div>
        `;
    }
}