import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    name: '',
    steamId: '',
    avatar_url: ''
  }),
  getters: {

  },
  actions: {

  }
})