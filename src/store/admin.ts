import { defineStore } from "pinia"
import axiosClient from "../axios"

export const useAdminStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    // roles: ['servers']
    roles: null as string[] | null,
  }),
  getters: {},
  actions: {
    async fetchRoles() {
      try {
        if (this.steamId) {
          const { data } = await axiosClient.get(
            `/players/${this.steamId}/roles`
          )

          // console.log(data)
          this.roles = data
          // this.roles = ["bans", "servers", "admin"]
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
})
