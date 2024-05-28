
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
