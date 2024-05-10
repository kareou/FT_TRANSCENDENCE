import Chat from '../pages/chat.js';
import Game from '../pages/game.js';
import Dashboard from '../pages/dashboard.js';
import SideBar from '../components/sidebar.js';
import TopBar from '../components/notification.js';
import Link from '../components/link.js';

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


// console.log("hello from router.js");