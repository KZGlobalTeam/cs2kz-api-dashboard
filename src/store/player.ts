import { defineStore } from "pinia"

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    // roles: ['servers']
    roles: null as string[] | null,
  }),
  getters: {},
})
