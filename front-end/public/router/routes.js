import SideBar from "../components/sidebar.js";
import TopBar from "../components/topBar.js";
import Link from "../components/link.js";
import Game_Option from "../components/game_option.js";
import Game_Starter from "../components/game_starter.js";
import Paddle_Option from "../components/paddle_option.js";
import Toast from "../components/toast.js";
import MatchmakingStats from "../components/matchmaking_stats.js";
import MatchMakingAvatar from "../components/matchmaking_avatar.js";
import GameScore from "../components/game_score.js";
import WinnerModal from "../components/winner_modal.js";

export const routes = [
  {
    path: "/",
    requireAuth: false,
    component: () => import("../pages/welcome.js"),
  },
  {
    path: "/signin", // Changed from "/signin" to "signin"
    requireAuth: false,
    component: () => import("../pages/signin.js"),
  },
  {
    path: "/signup", // Changed from "/signup" to "signup"
    requireAuth: false,
    component: () => import("../pages/signup.js"),
  },
  {
    path: "/dashboard",
    requireAuth: true,
    children: [
      {
        path: "", // Changed from "/" to "" for the default child route
        requireAuth: true,
        component: () => import("../pages/dashboard.js"),
      },
      {
        path: "/chat", // Changed from "/chat" to "chat"
        requireAuth: true,
        component: () => import("../pages/chat.js"),
      },
      {
        path: "/settings", // Changed from "/settings" to "settings"
        requireAuth: true,
        component: () => import("../pages/settings.js"),
      },
      {
        path: "/game", // Changed from "/game" to "game"
        requireAuth: true,
        children: [
          {
            path: "/online", // Changed from "/online" to "online"
            requireAuth: true,
            children: [
              {
                path: "/1v1", // Changed from "/1v1" to "1v1"
                requireAuth: true,
                component: () => import("../pages/matchmaking.js"),
              },
            ],
          },
          {
            path: "/local", // Changed from "/local" to "local"
            requireAuth: true,
            children: [
              {
                path: "/1v1", // Changed from "/1v1" to "1v1"
                requireAuth: true,
                component: () => import("../pages/game_page.js"),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/game",
    requireAuth: true,
    children: [
      {
        path: "/local",
        requireAuth: true,
        component: () => import("../pages/game/local_game.js"),
      },
      {
        path: "/online",
        requireAuth: true,
        component: () => import("../pages/game/online_game.js"),
      }
    ],
  },
];

// {
//   path: "/gameplay",
//   component: () => import("../pages/game/local_game.js"),
// },
// {
//   path: "/brackets",
//   component: () => import("../components/brackets.js"),
// },
