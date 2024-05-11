
import Game from '../pages/game.js';
import SideBar from '../components/sidebar.js';
import TopBar from '../components/notification.js';
import Link from '../components/link.js';

export const routes = [{
    path: '/',
    component: () => import('../pages/chat.js'),
},{
    path: '/dashboard',
    component: () => import('../pages/dashboard.js'),
},{
    path: '/game',
    component: () => import('../pages/game.js'),
}
];
