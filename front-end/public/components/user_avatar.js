export default class UserAvatar extends HTMLElement{
    constructor(){
        super();
        this.state = this.getAttribute('state');
        this.state = this.state == "true" ? "online" : "offline";
        this.img = this.getAttribute('image');
        this.width = this.getAttribute('width');
        this.height = this.getAttribute('height');
    }
    connectedCallback(){
        this.render();

    }
    render(){
        this.innerHTML = `
        <div class="icon-wrapper">
        <img src="${this.img}" alt="avatar" class="avatar_icon" style="width: ${this.width}px; height: ${this.height}px;" loading="lazy" />
        <div class="avatar_overlay ${this.state}" style="width: ${this.width}px; height: ${this.height}px;"></div>
        <div class="status_indicator ${this.state}"></div>
        </div>
        `;
    }
}

customElements.define('user-avatar', UserAvatar);
