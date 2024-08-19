

export const routes = [
  {
    path: "/",
    requireAuth: false,
    component: () => import("../pages/welcome.js"),
  },
  {
    path: "/auth",
    requireAuth: false,
    children: [
      {
        path: "/login", // Changed from "/signin" to "signin"
        requireAuth: false,
        component: () => import("../pages/signin.js"),
      },
      {
        path: "/register", // Changed from "/signup" to "signup"
        requireAuth: false,
        component: () => import("../pages/signup.js"),
      },
    ],
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
        path: "/profile", // Changed from "/settings" to "settings"
        requireAuth: true,
        component: () => import("../pages/profile.js"),
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
              {
                path: "/tournament", // Changed from "/tournament" to "tournament"
                requireAuth: true,
                component: () => import("../pages/tournament.js"),
              }
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
