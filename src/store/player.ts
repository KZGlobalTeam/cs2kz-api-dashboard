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
    async getPermissions() {
      this.loading = true
      try {
        if (this.steamId) {
          const { data } = await axiosClient.get(`/admins/${this.steamId}`)
          this.permissions = ["users", ...data.permissions]
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    readCookie() {
      const kzPlayer = cookies.get("kz-player")

      if (kzPlayer) {
        this.steamId = kzPlayer.steam_id
        this.avatar_url = kzPlayer.avatar_url
      }
    },
    async signIn() {
      location.href = `${import.meta.env.VITE_API_URL}/auth/login?redirect_to=${location.origin}`
    },
    async signOut() {
      try {
        this.$reset()

        cookies.remove("kz-player")

        await axiosClient.get(`/auth/logout`, { withCredentials: true })
      } catch (error) {
        console.log(error)
      }
    },
  },
})
