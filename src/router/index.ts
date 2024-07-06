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
    path: "/home/maps",
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
    path: "/home/maps/create",
    name: "createmap",
    component: () => import("../views/CreateMap.vue"),
    meta: {
      requiresPermission: "maps",
    },
  },
  {
    path: "/home/maps/:id/update",
    name: "updatemap",
    component: () => import("../views/UpdateMap.vue"),
    meta: {
      requiresPermission: "maps",
    },
  },
  {
    path: "/home/servers",
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
    path: "/home/myservers",
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
    path: "/home/servers/create",
    name: "createserver",
    component: () => import("../views/CreateServer.vue"),
    meta: {
      requiresPermission: "servers",
    },
  },
  {
    path: "/home/servers/:id/update",
    name: "updateserver",
    component: () => import("../views/UpdateServer.vue"),
    meta: {
      requiresPermission: "servers",
    },
  },
  {
    path: "/home/myservers/create",
    name: "createmyserver",
    component: () => import("../views/CreateServer.vue"),
  },
  {
    path: "/home/myservers/:id/update",
    name: "updatemyserver",
    component: () => import("../views/UpdateServer.vue"),
  },
  {
    path: "/home/bans",
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
    path: "/home/bans/create",
    name: "createban",
    component: () => import("../views/CreateBan.vue"),
    meta: {
      requiresPermission: "bans",
    },
  },
  {
    path: "/home/bans/:id/update",
    name: "updateban",
    component: () => import("../views/UpdateBan.vue"),
    meta: {
      requiresPermission: "bans",
    },
  },
  {
    path: "/home/bans/:id/unban",
    name: "unban",
    component: () => import("../views/Unban.vue"),
    meta: {
      requiresPermission: "bans",
    },
  },
  {
    path: "/home/bans/:id",
    name: "bandetails",
    component: () => import("../views/BanDetails.vue"),
    meta: {
      requiresPermission: "bans",
    },
  },
  {
    path: "/home/admins",
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
    path: "/home/admins/create",
    name: "createadmin",
    component: () => import("../views/CreateAdmin.vue"),
    meta: {
      requiresPermission: "admin",
    },
  },
  {
    path: "/home/admins/:steam_id/update",
    name: "updateadmin",
    component: () => import("../views/UpdateAdmin.vue"),
    meta: {
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
  try {
    if (to.meta.requiresPermission && to.name !== "home") {
      const requiredPermission = to.meta.requiresPermission as string
      if (!playerStore.permissions?.includes(requiredPermission))
        return { name: "home" }
    }
  } catch (error) {
    console.log(error)
  }
})

export default router
