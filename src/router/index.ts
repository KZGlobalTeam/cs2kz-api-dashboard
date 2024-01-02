import { createRouter, createWebHistory } from "vue-router";

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
    },
    {
      path: "/home/maps",
      name: "maps",
      component: () => import("../views/Maps.vue"),
    },
    {
      path: "/home/maps/:id",
      name: "map",
      component: () => import("../views/MapEditor.vue"),
    },
    {
      path: '/home/maps/create',
      name: 'createmap',
      component: () => import('../views/MapCreator.vue')
    },
    {
      path: "/home/servers",
      name: "servers",
      component: () => import("../views/Servers.vue"),
    },
    {
      path: "/home/bans",
      name: "bans",
      component: () => import("../views/Bans.vue"),
    },
    {
      path: "/home/jumpstats",
      name: "jumpstats",
      component: () => import("../views/Jumpstats.vue"),
    },
  ],
});

export default router;
