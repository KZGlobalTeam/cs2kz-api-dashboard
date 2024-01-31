<template>
  <div class="flex items-center h-16 w-full justify-between py-2 px-8 bg-gray-900 border-b border-b-slate-700 shadow-md">
    <p class="text-xl font-semibold">CS2KZ-API</p>

    <div v-if="loading">
      <n-button loading>LOADING</n-button>
    </div>

    <div v-else>
      <div class="flex gap-4" v-if="adminStore.steamId">
        <!-- avatar -->
        <img class="w-8 h-8 rounded-full ring-2 ring-slate-700" :src="adminStore.avatar_url" />
        <div>
          <n-button @click="handleSignOut" strong>SIGN OUT</n-button>
        </div>
      </div>
      <div v-else>
        <n-button @click="handleSignIn" text-color="#6dde6d" strong>SIGN IN</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue"
import { NButton } from "naive-ui"
import { useRouter } from "vue-router"
import { useAdminStore } from "../store/admin"
import axiosClient from "../axios"

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)

onBeforeMount(async () => {
  loading.value = true
  const playerCookie = getCookie("kz-player")
  // console.log(playerCookie)

  if (playerCookie) {
    const kzPlayer = JSON.parse(playerCookie)

    if (kzPlayer) {
      adminStore.steamId = kzPlayer.steam_id
      adminStore.avatar_url = kzPlayer.avatar_url
    }
  }

  loading.value = false
})

async function handleSignIn() {
  try {
    console.log(import.meta.env.VITE_API_URL);
    
    location.href = `${import.meta.env.VITE_API_URL}/auth/login?return_to=${location.origin}`
  } catch (error) {
    console.log(error)
  }
}

async function handleSignOut() {
  try {
    adminStore.$reset()
    document.cookie = "kz-player=; max-age=0; path=/;"
    await axiosClient.get("/auth/logout")
    router.push("/")
  } catch (error) {
    console.log(error)
  }
}

function getCookie(name: string) {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
      name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
      "=([^;]*)"
    )
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}
</script>
