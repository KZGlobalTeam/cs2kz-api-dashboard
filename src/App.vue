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
import {
  darkTheme,
  NConfigProvider,
  NNotificationProvider,
  NDialogProvider,
  enUS,
} from "naive-ui"

const route = useRoute()
</script>
