<template>
  <div
    class="flex h-16 w-full items-center justify-between border-b border-b-slate-700 bg-gray-900 px-8 py-2 shadow-md"
  >
    <p class="text-xl font-semibold">CS2KZ API</p>

    <div>
      <div class="flex gap-4" v-if="PlayerStore.steamId">
        <!-- avatar -->
        <img
          class="h-8 w-8 rounded-full ring-2 ring-slate-700"
          :src="PlayerStore.avatar_url"
        />
        <div>
          <n-button @click="handleSignOut" strong>SIGN OUT</n-button>
        </div>
      </div>
      <div v-else>
        <n-button @click="handleSignIn" strong>SIGN IN</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import { useRouter } from "vue-router"
import { usePlayerStore } from "../store/player"
import Cookies from "universal-cookie"
import axiosClient from "../axios"

const router = useRouter()
const PlayerStore = usePlayerStore()

const cookies = new Cookies(null, { path: "/" })

async function handleSignIn() {
  location.href = `${import.meta.env.VITE_API_URL}/auth/login?redirect_to=${location.origin}`
}

async function handleSignOut() {
  try {
    PlayerStore.$reset()
    cookies.remove("kz-player")
    await axiosClient.get(`/auth/logout`, { withCredentials: true })
    router.push("/")
  } catch (error) {
    console.log(error)
  }
}
</script>
../store/player
