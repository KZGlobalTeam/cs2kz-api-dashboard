import { createRouter, createWebHistory } from "vue-router"
import { usePlayerStore } from "../store/player"
import { Permission } from "../types"

export const noAuthRoutes = []

export const authRoutes = []

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../views/Home.vue"),
      meta: {
        title: "Home",
      },
    },
    {
      path: "/maps",
      name: "maps",
      component: () => import("../views/Maps.vue"),
      meta: {
        title: "Maps",
      },
    },
    {
      path: "/servers",
      name: "servers",
      component: () => import("../views/Servers.vue"),
      meta: {
        title: "Servers",
      },
    },
    {
      path: "/bans",
      name: "bans",
      component: () => import("../views/Bans.vue"),
      meta: {
        title: "Bans",
      },
    },
    {
      path: "/permissions",
      name: "permissions",
      component: () => import("../views/Permissions.vue"),
      meta: {
        title: "Permissions",
      },
    },
    {
      path: "/maps/create",
      name: "createmaps",
      component: () => import("../views/CreateMaps.vue"),
      meta: {
        title: "Create Maps",
      },
      beforeEnter: () => checkPermission(["create-maps"]),
    },
    {
      path: "/maps/:id/update",
      name: "updatemap",
      component: () => import("../views/UpdateMap.vue"),
      meta: {
        title: "Update Map",
      },
      beforeEnter: () => checkPermission(["update-maps", "create-maps"]),
    },
    {
      path: "/servers/create",
      name: "createserver",
      component: () => import("../views/CreateServer.vue"),
      meta: {
        title: "Create Server",
      },
      beforeEnter: () => checkPermission([]),
    },
    {
      path: "/servers/:id/update",
      name: "updateserver",
      component: () => import("../views/UpdateServer.vue"),
      meta: {
        title: "Update Server",
      },
      beforeEnter: () => checkPermission([]),
    },
    {
      path: "/bans/create",
      name: "createban",
      component: () => import("../views/CreateBan.vue"),
      meta: {
        title: "Create Ban",
      },
      beforeEnter: () => checkPermission(["create-bans"]),
    },
    {
      path: "/bans/:id/update",
      name: "updateban",
      component: () => import("../views/UpdateBan.vue"),
      meta: {
        title: "Update Ban",
      },
      beforeEnter: () => checkPermission(["update-bans"]),
    },
    {
      path: "/bans/:id/unban",
      name: "unban",
      component: () => import("../views/Unban.vue"),
      meta: {
        title: "Unban",
        requiresPermission: "revert-bans",
      },
      beforeEnter: () => checkPermission(["revert-bans"]),
    },
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFound.vue"),
    },
  ],
})

function checkPermission(requiredPermissions: Permission[]) {
  const playerStore = usePlayerStore()

  if (!playerStore.steamId) return false

  if (requiredPermissions.length === 0) return true

  return requiredPermissions.some((permission) => playerStore.permissions.includes(permission))
}

export default router
