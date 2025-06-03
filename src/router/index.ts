import { createRouter, createWebHistory } from "vue-router"
import { usePlayerStore } from "../store/player"
import { Permission } from "../types"

export const noAuthRoutes = [
  {
    path: "/home",
    name: "home",
    component: () => import("../views/Home.vue"),
    meta: {
      menuItem: true,
      title: "Home",
      iconName: "home",
      requiresPermission: null,
    },
  },
  {
    path: "/maps",
    name: "maps",
    component: () => import("../views/Maps.vue"),
    meta: {
      menuItem: true,
      title: "Maps",
      iconName: "map",
      requiresPermission: null,
    },
  },
  {
    path: "/servers",
    name: "servers",
    component: () => import("../views/Servers.vue"),
    meta: {
      menuItem: true,
      title: "Servers",
      iconName: "server",
      requiresPermission: null,
    },
  },
  {
    path: "/bans",
    name: "bans",
    component: () => import("../views/Bans.vue"),
    meta: {
      menuItem: true,
      title: "Bans",
      iconName: "ban",
      requiresPermission: null,
    },
  },
  {
    path: "/permissions",
    name: "permissions",
    component: () => import("../views/Permissions.vue"),
    meta: {
      menuItem: true,
      title: "Permissions",
      iconName: "person",
      requiresPermission: null,
    },
  },
]

export const authRoutes = [
  {
    path: "/maps/create",
    name: "createmaps",
    component: () => import("../views/CreateMaps.vue"),
    meta: {
      menuItem: false,
      title: "Create Maps",
      iconName: null,
      requiresPermission: "create-maps",
    },
  },
  {
    path: "/maps/:id/update",
    name: "updatemap",
    component: () => import("../views/UpdateMap.vue"),
    meta: {
      menuItem: false,
      title: "Update Map",
      iconName: null,
      requiresPermission: "create-maps",
    },
  },
  {
    path: "/servers/create",
    name: "createserver",
    component: () => import("../views/CreateServer.vue"),
    meta: {
      menuItem: false,
      title: "Create Server",
      iconName: null,
      requiresPermission: null,
    },
  },
  {
    path: "/servers/:id/update",
    name: "updateserver",
    component: () => import("../views/UpdateServer.vue"),
    meta: {
      menuItem: false,
      title: "Update Server",
      iconName: null,
      requiresPermission: null,
    },
  },
  {
    path: "/bans/create",
    name: "createban",
    component: () => import("../views/CreateBan.vue"),
    meta: {
      menuItem: false,
      title: "Create Ban",
      iconName: null,
      requiresPermission: "create-bans",
    },
  },
  {
    path: "/bans/:id/update",
    name: "updateban",
    component: () => import("../views/UpdateBan.vue"),
    meta: {
      menuItem: false,
      title: "Update Ban",
      iconName: null,
      requiresPermission: "update-bans",
    },
  },
  {
    path: "/bans/:id/unban",
    name: "unban",
    component: () => import("../views/Unban.vue"),
    meta: {
      menuItem: false,
      title: "Unban",
      iconName: null,
      requiresPermission: "revert-bans",
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    ...noAuthRoutes,
    ...authRoutes,
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFound.vue"),
    },
  ],
})

router.beforeEach(async (to) => {
  const playerStore = usePlayerStore()

  const requiredPermission = to.meta.requiresPermission as Permission | null

  if (requiredPermission && to.name !== "home") {
    if (!playerStore.permissions.includes(requiredPermission)) return { name: "home" }
  }
})

export default router
