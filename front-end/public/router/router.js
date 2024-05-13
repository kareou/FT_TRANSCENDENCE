import Chat from '../pages/chat.js';
import Game from '../pages/game.js';
import Dashboard from '../pages/dashboard.js';
import SideBar from '../components/sidebar.js';
import TopBar from '../components/notification.js';
import Link from '../components/link.js';


window.addEventListener('popstate', () => {
    Link.navigateTo(window.location.pathname);
}
);

window.onload = () => {
    Link.navigateTo(window.location.pathname);
};
