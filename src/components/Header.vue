<template>
  <div
    class="flex items-center h-16 w-full justify-between py-2 px-8 bg-gray-900 border-b border-b-slate-700 shadow-md"
  >
    <p class="text-xl font-semibold">CS2KZ-API</p>

    <div v-if="props.loading">
      <n-button loading>LOADING</n-button>
    </div>
    
    <div v-else>
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
import { apiBaseUrl } from "../types"
import { NButton } from "naive-ui"
import { useRouter } from "vue-router";
import { useAdminStore } from "../store/admin"
import axiosClient from "../axios";

const router = useRouter()
const adminStore = useAdminStore()

const props = defineProps<{
  loading: boolean
}>()

async function handleSignIn() {
  try {
    location.href = `${apiBaseUrl}/auth/steam/login?origin_url=${location.origin}`
  } catch (error) {
    console.log(error)
  }
}

async function handleSignOut() {
  try {
    adminStore.$reset()
    await axiosClient.get('/auth/steam/logout')
    // document.cookie = "steam_id=; max-age=0; path=/;"
    router.push("/")
  } catch (error) {
    console.log(error)
  }
}
</script>
