import { defineStore } from "pinia"
import axiosClient from "../axios"
import Cookies from "universal-cookie"

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    permissions: null as string[] | null,
    loading: false,
  }),
  actions: {
    async getPermissions() {
      this.loading = true
      try {
        const cookies = new Cookies(null, { path: "/" })
        const kzPlayer = cookies.get("kz-player")

        if (kzPlayer) {
          this.steamId = kzPlayer.steam_id
          this.avatar_url = kzPlayer.avatar_url

          const { data } = await axiosClient.get(`/admins/${kzPlayer.steam_id}`)

          this.permissions = ["users", ...data.permissions]
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
  },
})
