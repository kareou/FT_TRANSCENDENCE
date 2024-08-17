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

    async getNotification(){
        const response = await fetch('http://localhost:8000/api/notification/get_unread/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        console.log(data)
        const notificationContainer = this.querySelector('.notification_container');
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
            notificationContainer.appendChild(notificationDiv);
        }
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
        this.getNotification();
        const notification = this.querySelector('.notification_wrapper');
        notification.addEventListener('click', () => {
            document.querySelector('.notification_dropdown').classList.toggle('show');
        });
        const notificationButton = this.querySelector('.notification_button');
        notificationButton.addEventListener('click', this.markAllRead.bind(this));
    }
}

customElements.define('notification-icon', Notification);