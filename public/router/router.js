import Chat from '../pages/chat.js';
import Game from '../pages/game.js';
import Dashboard from '../pages/dashboard.js';
import SideBar from '../components/sidebar.js';
import TopBar from '../components/notification.js';
import Link from '../components/link.js';
import {routes} from './routes.js';


// window.history.pushState({}, {}, window.location.origin);

// const app = document.querySelector('#app');

// const route = "/";

// const links = document.querySelectorAll('.link');

// links.forEach((link) => {
//     link.addEventListener('click' , (e) =>{
//         e.preventDefault();
//         let href = link.getAttribute('href');
//         if (href.length > 1)
//             href = href.substring(1, href.length);
//         if (href === '/')
//         {
//             window.history.pushState({}, href, window.location.origin + href);
//             console.log("in here "+ href)
//         }
//         else
//             window.history.pushState({}, href, window.location.origin + '/' + href);
//         console.log(href);
//     })
// });

// const navigateTo = (url) => {
// 	window.history.pushState({}, '', url);
// 	router();
// };

// window.onload = () => {
// 	document.addEventListener('click', (e) => {
// 		if (e.target.matches('co-link') || e.target.parentElement.matches('co-link')){
// 			// e.preventDefault();
// 			// navigateTo(e.target.href);
// 			console.log(window.history.state);
// 		}
// 	}
// 	);
// };


// console.log("hello from router.js");
