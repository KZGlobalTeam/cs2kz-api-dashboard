<template>
  <div class="font-poppings text-slate-200">
    <n-config-provider :theme="darkTheme" :locale="enUS">
      <n-dialog-provider>
        <n-message-provider>
          <Header :loading="loading" />
          <div class="flex">
            <NavBar />
            <div class="flex-1 bg-gray-900 p-4">
              <div v-if="route.name" class="flex mb-4">
                <div class="flex items-center mr-1" v-for="(part, index) in pathArray" :key="index">
                  <RouterLink class="mr-1" :class="index !== pathArray.length - 1
                    ? 'bg-gray-800 hover:bg-gray-700 text-blue-600 py-1 px-[10px] rounded-md'
                    : 'cursor-default'
                    " :to="getLink(index)">{{ part }}
                  </RouterLink>
                  <img v-if="index !== pathArray.length - 1" src="/icons/arrow-forward-sharp.svg" class="w-4 auto"/>
                </div>
              </div>
              <RouterView />
            </div>
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Header from "./components/Header.vue"
import NavBar from "./components/NavBar.vue"
import { RouterView, useRoute } from "vue-router"
import { computed } from "vue"
import {
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  enUS,
} from "naive-ui"
import { useAdminStore } from "./store/admin"
import axiosClient from "./axios"

const adminStore = useAdminStore()
const route = useRoute()

const loading = ref(false)

const pathArray = computed(() =>
  route.path
    .split("/")
    .filter((item) => item !== "")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
)

getAdmin()

async function getAdmin() {
  loading.value = true
  const playerCookie = getCookie("kz-player")
  // console.log(playerCookie)

  if (playerCookie) {
    const kzPlayer = JSON.parse(playerCookie)

    const { data } = await axiosClient.get(
      `/admins/${kzPlayer.steam_id}`
    )

    if (kzPlayer) {
      adminStore.steamId = kzPlayer.steam_id
      adminStore.avatar_url = kzPlayer.avatar_url
      adminStore.roles = data.roles
    }
  }

  loading.value = false
}

function getLink(index: number) {
  const path = pathArray.value
    .slice(0, index + 1)
    .join("/")
    .toLowerCase()
  return "/" + path
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

<style scoped>
ion-icon {
  font-size: 32;
}
</style>
