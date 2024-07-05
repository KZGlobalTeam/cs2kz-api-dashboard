import { defineStore } from "pinia"

export const usePlayerStore = defineStore("admin", {
  state: () => ({
    steamId: "",
    avatar_url: "",
    permissions: null as string[] | null,
  }),
  getters: {},
})
