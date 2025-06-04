import { defineStore } from "pinia"
import type { Permission } from "../types"
import axiosClient from "../axios"
import Cookies from "universal-cookie"

const cookies = new Cookies(null, { path: "/" })

export const usePlayerStore = defineStore("player", {
  state: () => ({
    steamId: "",
    avatarUrl: "",
    serverBudget: 0,
    permissions: [] as Permission[],
    loading: false,
  }),
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
