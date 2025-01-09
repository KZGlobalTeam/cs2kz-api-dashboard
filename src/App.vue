<template>
  <n-config-provider :theme="darkTheme" :locale="enUS">
    <n-dialog-provider>
      <n-notification-provider>
        <div class="font-poppings text-slate-200">
          <Header />
          <div class="flex">
            <NavBar />
            <div class="flex-1 bg-gray-900 p-4">
              <div class="mb-2 text-2xl font-semibold">
                {{ route.meta.title }}
              </div>
              <RouterView />
            </div>
          </div>
        </div>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import Header from "./components/Header.vue"
import NavBar from "./components/NavBar.vue"
import { RouterView, useRoute, useRouter } from "vue-router"
import {
  darkTheme,
  NConfigProvider,
  NNotificationProvider,
  NDialogProvider,
  enUS,
} from "naive-ui"
import { usePlayerStore } from "./store/player"
import axiosClient from "./axios"
import Cookies from "universal-cookie"

const cookies = new Cookies(null, { path: "/" })

const playerStore = usePlayerStore()

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  playerStore.readPlayer()
  // if logged in
  if (playerStore.steamId) {
    await verifySession()
  }
})

async function verifySession() {
  try {
    await axiosClient.get("/auth/web", { withCredentials: true })

    setTimeout(verifySession, 1000 * 3)
  } catch (error: any) {
    // if (error.response.status >= 400) {
    //   playerStore.$reset()
    //   cookies.remove("kz-player")
    //   router.push("/")
    // }
  }
}
</script>
