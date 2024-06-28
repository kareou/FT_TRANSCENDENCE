
import SideBar from '../components/sidebar.js';
import TopBar from '../components/topBar.js';
import Link from '../components/link.js';
import Http from '../http/http.js';


window.addEventListener('popstate', () => {
    Link.navigateTo(window.location.pathname);
}
);

window.onload = async (e) => {
    e.preventDefault();
    Link.navigateTo(window.location.pathname);
};
