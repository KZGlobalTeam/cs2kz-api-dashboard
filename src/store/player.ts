import { defineStore } from "pinia"
import axiosClient from "../axios"
import Cookies from "universal-cookie"

const cookies = new Cookies(null, { path: "/" })

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    permissions: [] as string[],
    loading: false,
  }),
  actions: {
    async readPlayer() {
      this.loading = true

      const kzPlayer = cookies.get("kz-player")

      if (kzPlayer) {
        this.steamId = kzPlayer.steam_id
        this.avatar_url = kzPlayer.avatar_url

        try {
          const { data } = await axiosClient.get(`/admins/${this.steamId}`)
          this.permissions = ["users", ...data.permissions]
        } catch (error: any) {
          if (error.response.status === 404) {
            this.permissions = ["users"]
          }
        } finally {
          this.loading = false
        }
      }
    },
  },
})
