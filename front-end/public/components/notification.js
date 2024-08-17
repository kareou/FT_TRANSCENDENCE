export default class Notification extends HTMLElement{
    constructor(){
        super();
        this.state = this.getAttribute('state');
        this.img = this.getAttribute('image');
        this.width = this.getAttribute('width');
        this.height = this.getAttribute('height');
    }
    connectedCallback(){
        this.render();
    }

    async renderNotification(){
        // const response = await fetch('http://localhost:3000/api/notification', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     credentials: 'include',
        // });
        // const data = await data.json();
        const notificationContainer = this.querySelector('.notification_container');
        const dropdown =document.querySelector('.notification_dropdown');
        if (dropdown.classList.contains('show')){
            dropdown.classList.remove('show');
            document.querySelector('.notification_container').innerHTML = '';
            return;
        }
        // if (data.length > 0){
        //     data.forEach(notification => {
        //         const notificationDiv = document.createElement('div');
        //         notificationDiv.classList.add('notification');
        //         notificationDiv.innerHTML = `
        //             <div class="notification_image">
        //                 <img src="${notification.img}" alt="avatar" class="avatar_icon">
        //             </div>
        //             <div class="notification_content">
        //                 <h2>${notification.title}</h2>
        //                 <p>${notification.content}</p>
        //             </div>
        //         `;
        //         notificationContainer.appendChild(notificationDiv);
        //     });
        // }else{
            const notificationDiv = document.createElement('div');
            notificationDiv.classList.add('notification');
            notificationDiv.innerHTML = `
                <div class="notification_content">
                    <h2>No Notifications</h2>
                </div>
            `;
            notificationContainer.appendChild(notificationDiv);
        // }
        document.querySelector('.notification_dropdown').classList.toggle('show');
    }

    render(){
        this.innerHTML = `
            <div style="position: relative;">
            <button class="notification_wrapper">
            <i class="fa-thin fa-bell fa-xl notification_icon" style="color: white;"></i>
            </button>
            <div class="notification_dropdown ">
                <h1>Notifications</h1>
                <div class="notification_container">
                </div>
                <button class="notification_button">View All</button>
            </div>
            </div>
            `;
        const notification = this.querySelector('.notification_wrapper');
        notification.addEventListener('click', this.renderNotification.bind(this));
    }
}

customElements.define('notification-icon', Notification);