<template>
  <div class="menu min-h-screen bg-gray-800 px-2 py-4">
    <n-menu v-model:value="activeKey" :options="menuOptions" />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue"
import { RouterLink } from "vue-router"
import { usePlayerStore } from "../store/player"
import { noAuthRoutes, routes } from "../router"
import { NMenu } from "naive-ui"
import type { MenuOption } from "naive-ui"

const playerStore = usePlayerStore()

const activeKey = ref<string | null>(null)

const menuOptions = ref<MenuOption[]>([])

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

  menuOptions.value = [...noAuthRoutes, ...authRoutes].map((route) => ({
    label: () =>
      h(
        "div",
        {
          class: "flex gap-2",
        },
        [
          h("img", {
            src: `/icons/${route.meta.iconName}-sharp.svg`,
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
})
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
