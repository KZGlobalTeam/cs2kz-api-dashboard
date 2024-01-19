import { createRouter, createWebHistory } from "vue-router"
import { useAdminStore } from "../store/admin"

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
      requiresRole: "maps",
    },
  },
  {
    path: "/home/maps/:id",
    name: "map",
    component: () => import("../views/MapEditor.vue"),
    meta: {
      requiresRole: "maps",
    },
  },
  {
    path: "/home/maps/create",
    name: "createmap",
    component: () => import("../views/MapEditor.vue"),
    meta: {
      requiresRole: "maps",
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
      requiresRole: "servers",
    },
  },
  {
    path: "/home/bans",
    name: "bans",
    component: () => import("../views/Bans.vue"),
    meta: {
      menuItem: true,
      title: "Bans",
      iconName: "ban",
      requiresRole: "bans",
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
      requiresRole: "admin",
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
  const adminStore = useAdminStore()
  try {
    await adminStore.fetchPermissions()
    if (to.meta.requiresRole && to.name !== "home") {
      const requiredRole = to.meta.requiresRole as string
      // actually the roles is null until the permission request is done
      if (!adminStore.roles?.includes(requiredRole)) return { name: "home" }
    }
  } catch (error) {
    console.log(error)
  }
})

export default router
