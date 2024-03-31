<template>
  <div
    class="flex items-center h-16 w-full justify-between py-2 px-8 bg-gray-900 border-b border-b-slate-700 shadow-md"
  >
    <p class="text-xl font-semibold">CS2KZ API</p>

    <div>
      <div class="flex gap-4" v-if="adminStore.steamId">
        <!-- avatar -->
        <img
          class="w-8 h-8 rounded-full ring-2 ring-slate-700"
          :src="adminStore.avatar_url"
        />
        <div>
          <n-button @click="handleSignOut" strong>SIGN OUT</n-button>
        </div>
      </div>
      <div v-else>
        <n-button @click="handleSignIn" text-color="#6dde6d" strong
          >SIGN IN</n-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import { useRouter } from "vue-router"
import { useAdminStore } from "../store/admin"
import Cookies from "universal-cookie"
import axiosClient from "../axios"

const router = useRouter()
const adminStore = useAdminStore()

const cookies = new Cookies(null, { path: "/" })

async function handleSignIn() {
  location.href = `${import.meta.env.VITE_API_URL}/auth/login?redirect_to=${location.origin}`
}

async function handleSignOut() {
  try {
    adminStore.$reset()
    cookies.remove("kz-player")
    await axiosClient.get(`/auth/logout`, { withCredentials: true })
    router.push("/")
  } catch (error) {
    console.log(error)
  }
}
</script>
