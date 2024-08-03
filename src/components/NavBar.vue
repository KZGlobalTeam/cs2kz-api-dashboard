<template>
  <div class="flex min-h-screen w-[200px] flex-col bg-gray-800 px-2 py-4">
    <div>
      <RouterLink
        v-for="route in noAuthRoutes"
        :key="route.name"
        :to="route.path"
        class="flex cursor-pointer gap-4 rounded-md p-2 hover:bg-gray-700"
      >
        <img
          :src="`/icons/${route.meta.iconName}-sharp.svg`"
          class="h-auto w-5"
        />
        <p class="font-medium">{{ route.meta?.title }}</p>
      </RouterLink>
    </div>

    <RouterLink
      v-for="route in authRoutes"
      :key="route.name"
      :to="route.path"
      class="flex cursor-pointer gap-4 rounded-md p-2 hover:bg-gray-700"
    >
      <img
        :src="`/icons/${route.meta?.iconName}-sharp.svg`"
        class="h-auto w-5"
      />
      <p class="font-medium">{{ route.meta?.title }}</p>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePlayerStore } from "../store/player"
import { noAuthRoutes, routes } from "../router"

const playerStore = usePlayerStore()

const authRoutes = computed(() => {
  return routes.filter((route) => {
    if (route.meta?.menuItem) {
      if (!playerStore.permissions) return false
      else
        return playerStore.permissions.includes(route.meta.requiresPermission)
    } else {
      return false
    }
  })
})
</script>
