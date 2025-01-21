import { defineStore } from "pinia"
import { h } from "vue"
import { RouterLink } from "vue-router"
import axiosClient from "../axios"
import Cookies from "universal-cookie"
import { noAuthRoutes, routes } from "../router"

type Routes = typeof noAuthRoutes | typeof routes

const cookies = new Cookies(null, { path: "/" })

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    permissions: [] as string[],
    loading: false,
  }),
  getters: {
    menuItems: (state) => {
      const authRoutes: Routes = routes.filter((route) => {
        if (route.meta?.menuItem) {
          if (route.meta.requiresPermission === undefined) {
            return true
          } else {
            if (state.permissions.length === 0) return false
            else return state.permissions.includes(route.meta.requiresPermission)
          }
        } else {
          return false
        }
      })

      return [...noAuthRoutes, ...authRoutes].map((route) => ({
        label: () =>
          h(
            "div",
            {
              class: "flex gap-2",
            },
            [
              h("img", {
                src: `/icons/${route.meta.iconName}.svg`,
                class: "h-auto w-4",
              }),
              ,
              h(
                RouterLink,
                {
                  to: route.path,
                  class: "",
                },
                { default: () => route.meta.title! },
              ),
            ],
          ),
        key: route.name,
      }))
    },
  },
  actions: {
    async readPlayer() {
      this.loading = true

      const kzPlayer = cookies.get("kz-player")

      if (kzPlayer) {
        this.steamId = kzPlayer.id
        this.avatar_url = kzPlayer.avatar_url

        try {
          const { data } = await axiosClient.get(`/users/${this.steamId}`)
          this.permissions = data.permissions
        } catch (error: any) {
          if (error.response.status === 404) {
            this.permissions = []
          }
        } finally {
          this.loading = false
        }
      }
    },
  },
})
