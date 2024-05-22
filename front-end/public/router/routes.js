import SideBar from "../components/sidebar.js";
import TopBar from "../components/notification.js";
import Link from "../components/link.js";
import Game_Option from "../components/game_option.js";
import Game_Starter from "../components/game_starter.js";
import Paddle_Option from "../components/paddle_option.js";

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
    component: () => import("../pages/game_page.js"),
  },
  {
    path: "/online_game",
    component: () => import("../pages/online_game_page.js"),
  },
  {
    path: "/gameplay",
    component: () => import("../pages/game/online_game.js"),
  },
  {
    path: "/brackets",
    component: () => import("../components/brackets.js"),
  },
];
