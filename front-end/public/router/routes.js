import Game from "../pages/game.js";
import SideBar from "../components/sidebar.js";
import TopBar from "../components/notification.js";
import Link from "../components/link.js";

export const routes = [
  {
    path: "/",
    component: () => import("../pages/welcome.js"),
  },
  {
    path: "/signin",
    component: () => import("../pages/signin.js"),
  },
  {
    path: "/signup",
    component: () => import("../pages/signup.js"),
  },
  {
    path: "/chat",
    component: () => import("../pages/chat.js"),
  },
  {
    path: "/dashboard",
    component: () => import("../pages/dashboard.js"),
  },
  {
    path: "/game",
    component: () => import("../pages/game.js"),
  },
];
