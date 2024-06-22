
import SideBar from '../components/sidebar.js';
import TopBar from '../components/notification.js';
import Link from '../components/link.js';
import Http from '../http/http.js';


window.addEventListener('popstate', () => {
    Link.navigateTo(window.location.pathname);
}
);

window.onload = (e) => {
    e.preventDefault();
    Link.navigateTo(window.location.pathname);
};
