<template>
  <div class="font-poppings text-slate-200">
    <n-config-provider :theme="darkTheme" :locale="enUS">
      <n-dialog-provider>
        <n-notification-provider>
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
        </n-notification-provider>
      </n-dialog-provider>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue"
import NavBar from "./components/NavBar.vue"
import { RouterView, useRoute } from "vue-router"
import Cookies from "universal-cookie"
import {
  darkTheme,
  NConfigProvider,
  NNotificationProvider,
  NDialogProvider,
  enUS,
} from "naive-ui"
import { usePlayerStore } from "./store/player"
import axiosClient from "./axios"

const playerStore = usePlayerStore()
const route = useRoute()

const cookies = new Cookies(null, { path: "/" })

getAdmin()

async function getAdmin() {
  const kzPlayer = cookies.get("kz-player")

  if (kzPlayer) {
    playerStore.steamId = kzPlayer.steam_id
    playerStore.avatar_url = kzPlayer.avatar_url

    const { data } = await axiosClient.get(`/admins/${kzPlayer.steam_id}`)

    playerStore.permissions = ["users", ...data.permissions]
  }
}
</script>
