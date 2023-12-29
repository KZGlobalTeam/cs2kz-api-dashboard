import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: '/maps'
    },
    {
      path: '/maps',
      name: 'maps',
      component: () => import('../views/MapsView.vue')
    }
  ],
})

export default router