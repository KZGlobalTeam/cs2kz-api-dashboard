import { defineStore } from "pinia"
import { h } from "vue"
import { RouterLink } from "vue-router"
import type { Permission } from "../types"
import axiosClient from "../axios"
import Cookies from "universal-cookie"
import { noAuthRoutes, authRoutes } from "../router"

const cookies = new Cookies(null, { path: "/" })

export const usePlayerStore = defineStore("player", {
  state: () => ({
    steamId: "",
    avatarUrl: "",
    serverBudget: 0,
    permissions: [] as Permission[],
    loading: false,
  }),
  getters: {
    menuItems: (state) => {
      const menuRoutes = [...noAuthRoutes, ...authRoutes].filter((route) => {
        if (route.meta.menuItem) {
          if (route.meta.requiresPermission === null) {
            return true
          } else {
            return state.permissions.includes(route.meta.requiresPermission as Permission)
          }
        } else {
          return false
        }
      })

      return menuRoutes.map((route) => ({
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
        this.avatarUrl = kzPlayer.avatar_url

        try {
          const { data } = await axiosClient.get(`/users/${kzPlayer.id}`)
          this.steamId = data.id
          this.permissions = data.permissions
          this.serverBudget = data.server_budget
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
