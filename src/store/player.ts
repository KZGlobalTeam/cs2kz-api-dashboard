import { defineStore } from "pinia"
import axiosClient from "../axios"
import Cookies from "universal-cookie"

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    permissions: null as string[] | null,
  }),
  actions: {
    async getPermissions() {
      const cookies = new Cookies(null, { path: "/" })
      const kzPlayer = cookies.get("kz-player")

      if (kzPlayer) {
        this.steamId = kzPlayer.steam_id
        this.avatar_url = kzPlayer.avatar_url

        const { data } = await axiosClient.get(`/admins/${kzPlayer.steam_id}`)

        this.permissions = ["users", ...data.permissions]
      }
    },
  },
})
