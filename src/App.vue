<template>
  <div class="font-poppings text-slate-200">
    <n-config-provider :theme="darkTheme" :locale="enUS">
      <n-dialog-provider>
        <n-notification-provider>
          <Header />
          <div class="flex">
            <NavBar />
            <div class="flex-1 bg-gray-900 p-4">
              <div v-if="route.name" class="flex mb-4">
                <div
                  class="flex items-center mr-1"
                  v-for="(part, index) in pathArray"
                  :key="index"
                >
                  <RouterLink
                    :to="getLink(index)"
                    class="mr-1"
                    :class="
                      index !== pathArray.length - 1
                        ? 'bg-gray-800 hover:bg-gray-700 text-blue-600 py-1 px-[10px] rounded-md'
                        : 'cursor-default'
                    "
                  >
                    {{ part }}
                  </RouterLink>
                  <img
                    v-if="index !== pathArray.length - 1"
                    src="/icons/arrow-forward-sharp.svg"
                    class="w-4 auto"
                  />
                </div>
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
import { computed } from "vue"
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

const pathArray = computed(() =>
  route.path
    .split("/")
    .filter((item) => item !== "")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1)),
)

getAdmin()

async function getAdmin() {
  const kzPlayer = cookies.get("kz-player")

  if (kzPlayer) {
    playerStore.steamId = kzPlayer.steam_id
    playerStore.avatar_url = kzPlayer.avatar_url

    const { data } = await axiosClient.get(`/admins/${kzPlayer.steam_id}`)

    playerStore.permissions = data.permissions
  }
}

function getLink(index: number) {
  const path = pathArray.value
    .slice(0, index + 1)
    .join("/")
    .toLowerCase()
  return "/" + path
}
</script>
./store/player
