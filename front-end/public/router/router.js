
import SideBar from '../components/sidebar.js';
import TopBar from '../components/topBar.js';
import Link from '../components/link.js';
import Http from '../http/http.js';


window.addEventListener('popstate', () => {
  Link.navigateTo(window.location.pathname);
}
);

// let isRefresh = false;

window.onload = async (e) => {
  e.preventDefault();
  // isRefresh = false;
  Link.navigateTo(window.location.pathname);
};


// window.addEventListener('visibilitychange', function () {
//   if (document.visibilityState === 'hidden') {
//     console.log('Tab is hidden');
//     isRefresh = true;
//   }
// });

// window.addEventListener('beforeunload', function () {
//   if (isRefresh) {
//     console.log('Page refreshed');
//   } else {
//     console.log('Page exited');
//     if (Http.notification_socket) {
//       Http.notification_socket.send(
//         JSON.stringify({ type: 'status_update', sender: Http.user.id, message: "", receiver: 0 })
//       );
//     }
//   }
// });
