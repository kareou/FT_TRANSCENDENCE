import Http from '../http/http.js';

export default class Notification extends HTMLElement{
    constructor(){
        super();
        Http.website_stats.addObserver({
            update: () => this.update(),
            event: "notification",
            data: this.matchmakingstate,
        });
    }
    connectedCallback(){
        this.render();
    }

    update(){
        this.render();
    }

    async getNotification(){
        const response = await fetch('http://localhost:8000/api/notification/get_unread/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        const notificationContainer = this.querySelector('.notification_container');
        notificationContainer.innerHTML = '';
        const dropdown = document.querySelector('.notification_dropdown');
        if (data.length > 0){
            data.forEach(notification => {
                const notificationDiv = document.createElement('div');
                notificationDiv.classList.add('notification');
                notificationDiv.innerHTML = `
                    <div class="notification_content">
                        <h2>${notification.type}</h2>
                        <p>${notification.message}</p>
                    </div>
                `;
                notificationContainer.appendChild(notificationDiv);
            });
        }else{
            const notificationDiv = document.createElement('div');
            notificationDiv.classList.add('notification');
            notificationDiv.innerHTML = `
                <div class="notification_content">
                    <h2>No Notifications</h2>
                </div>
            `;
            // notificationContainer.addEventListener("animationend", () => {
                notificationContainer.appendChild(notificationDiv);
            // });
        };
    }

    async markAllRead(){
        const response = await fetch('http://localhost:8000/api/notification/mark_all_read/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (response.ok){
            this.render();
        }
    }

    render(){
        this.innerHTML = `
            <div style="position: relative;">
                <button class="notification_wrapper">
                <i class="fa-light fa-bell fa-2xl notification_icon" style="color: white;"></i>
                </button>
                <div class="notification_dropdown ">
                    <h1>Notifications</h1>
                    <div class="notification_container">
                    </div>
                </div>
            </div>
            `;
            const notification = this.querySelector('.notification_wrapper');
            notification.addEventListener('click', () => {
                document.querySelector('.notification_dropdown').classList.toggle('show');
                document.querySelector(".notification_dropdown").style.top = "3.5rem";
                document.querySelector(".notification_dropdown").style.right = "-1rem";
                document.querySelector(".notification_dropdown").style.width = "20rem";
                document.querySelector(".notification_dropdown").addEventListener("animationend", this.getNotification().bind(this));
        });

        const notificationButton = this.querySelector('.notification_button');
        notificationButton.addEventListener('click', this.markAllRead.bind(this));
    }
}

customElements.define('notification-icon', Notification);
