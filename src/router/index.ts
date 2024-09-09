import { createRouter, createWebHistory } from "vue-router"
import { usePlayerStore } from "../store/player"

export const noAuthRoutes = [
  {
    path: "/home",
    name: "home",
    component: () => import("../views/Home.vue"),
    meta: {
      title: "Home",
      iconName: "home",
    },
  },
]

export const routes = [
  {
    path: "/maps",
    name: "maps",
    component: () => import("../views/Maps.vue"),
    meta: {
      menuItem: true,
      title: "Maps",
      iconName: "map",
      requiresPermission: "maps",
    },
  },
  {
    path: "/maps/create",
    name: "createmaps",
    component: () => import("../views/CreateMaps.vue"),
    meta: {
      title: "Create Maps",
      requiresPermission: "maps",
    },
  },
  {
    path: "/maps/:id/update",
    name: "updatemap",
    component: () => import("../views/UpdateMap.vue"),
    meta: {
      title: "Update Map",
      requiresPermission: "maps",
    },
  },
  {
    path: "/maps/:id/removecourse",
    name: "removecourse",
    component: () => import("../views/RemoveCourse.vue"),
    meta: {
      title: "Remove Course",
      requiresPermission: "maps",
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
      requiresPermission: "servers",
    },
  },
  {
    path: "/myservers",
    name: "myservers",
    component: () => import("../views/MyServers.vue"),
    meta: {
      menuItem: true,
      title: "My Servers",
      iconName: "server",
      requiresPermission: "users",
    },
  },
  {
    path: "/servers/create",
    name: "createserver",
    component: () => import("../views/CreateServer.vue"),
    meta: {
      title: "Create Server",
      requiresPermission: "servers",
    },
  },
  {
    path: "/servers/:id/update",
    name: "updateserver",
    component: () => import("../views/UpdateServer.vue"),
    meta: {
      title: "Update Server",
      requiresPermission: "servers",
    },
  },
  {
    path: "/myservers/create",
    name: "createmyserver",
    component: () => import("../views/CreateServer.vue"),
    meta: {
      title: "Create Server",
    },
  },
  {
    path: "/myservers/:id/update",
    name: "updatemyserver",
    component: () => import("../views/UpdateServer.vue"),
    meta: {
      title: "Update Server",
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
      requiresPermission: "bans",
    },
  },
  {
    path: "/bans/create",
    name: "createban",
    component: () => import("../views/CreateBan.vue"),
    meta: {
      title: "Create Ban",
      requiresPermission: "bans",
    },
  },
  {
    path: "/bans/:id/update",
    name: "updateban",
    component: () => import("../views/UpdateBan.vue"),
    meta: {
      title: "Update Ban",
      requiresPermission: "bans",
    },
  },
  {
    path: "/bans/:id/unban",
    name: "unban",
    component: () => import("../views/Unban.vue"),
    meta: {
      title: "Unban",
      requiresPermission: "bans",
    },
  },
  {
    path: "/bans/:id",
    name: "bandetails",
    component: () => import("../views/BanDetails.vue"),
    meta: {
      title: "Ban Details",
      requiresPermission: "bans",
    },
  },
  {
    path: "/admins",
    name: "admins",
    component: () => import("../views/Admins.vue"),
    meta: {
      menuItem: true,
      title: "Admins",
      iconName: "person",
      requiresPermission: "admin",
    },
  },
  {
    path: "/admins/create",
    name: "createadmin",
    component: () => import("../views/CreateAdmin.vue"),
    meta: {
      title: "Create Admin",
      requiresPermission: "admin",
    },
  },
  {
    path: "/admins/:steam_id/update",
    name: "updateadmin",
    component: () => import("../views/UpdateAdmin.vue"),
    meta: {
      title: "Update Admin",
      requiresPermission: "admin",
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
    ...routes,
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFound.vue"),
    },
  ],
})

router.beforeEach(async (to) => {
  const playerStore = usePlayerStore()
  playerStore.readCookie()
  await playerStore.getPermissions()

  if (to.meta.requiresPermission && to.name !== "home") {
    const requiredPermission = to.meta.requiresPermission as string
    if (!playerStore.permissions?.includes(requiredPermission))
      return { name: "home" }
  }
})

export default router
