<template>
  <div class="menu min-h-screen bg-gray-800 px-2 py-4">
    <n-menu v-model:value="activeKey" :options="menuOptions" />
  </div>
</template>

<script setup lang="ts">
import { h, ref, watch } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { usePlayerStore } from "../store/player"
import { noAuthRoutes, routes } from "../router"
import { NMenu } from "naive-ui"
import type { MenuOption } from "naive-ui"

type Routes = typeof noAuthRoutes | typeof routes

const playerStore = usePlayerStore()

const route = useRoute()

const activeKey = ref<string>("home")

const menuOptions = ref<MenuOption[]>(toMenuOptions(noAuthRoutes))

watch(
  () => route.name,
  (name) => {
    activeKey.value = name as string
  },
)

playerStore.$subscribe(() => {
  const authRoutes = routes.filter((route) => {
    if (route.meta?.menuItem) {
      if (!playerStore.permissions) return false
      else
        return playerStore.permissions.includes(route.meta.requiresPermission)
    } else {
      return false
    }
  })

  menuOptions.value = toMenuOptions([...noAuthRoutes, ...authRoutes] as Routes)
})

function toMenuOptions(rts: Routes) {
  return rts.map((route) => ({
    label: () =>
      h(
        "div",
        {
          class: "flex gap-2",
        },
        [
          h("img", {
            src: `/icons/${route.meta.iconName}.svg`,
            class: "h-auto w-4",
          }),
          ,
          h(
            RouterLink,
            {
              to: route.path,
              class: "",
            },
            { default: () => route.meta.title! },
          ),
        ],
      ),
    key: route.name,
  }))
}
</script>

<style scoped>
.menu :deep(.n-menu-item-content) {
  padding-left: 20px !important;
  height: 36px;
}
.menu :deep(.n-menu-item) {
  margin-top: 0;
}
</style>
