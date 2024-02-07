<template>
  <div class="w-[200px] bg-gray-800 min-h-screen flex flex-col py-4 px-2">
    <div class="border-b border-slate-600">
      <RouterLink v-for="route in noAuthRoutes" :key="route.name" :to="route.path"
        class="flex gap-4 p-2 hover:bg-gray-700 rounded-md cursor-pointer">
        <img :src="`/icons/${route.meta.iconName}-sharp.svg`" class="w-5 h-auto" />
        <p class="font-medium">{{ route.meta?.title }}</p>
      </RouterLink>
    </div>


    <RouterLink v-for="route in authRoutes" :key="route.name" :to="route.path"
      class="flex gap-4 p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <img :src="`/icons/${route.meta.iconName}-sharp.svg`" class="w-5 h-auto" />
      <p class="font-medium">{{ route.meta?.title }}</p>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useAdminStore } from "../store/admin"
import { noAuthRoutes, routes } from "../router"

const adminStore = useAdminStore()

const authRoutes = computed(() => {
  return routes.filter((route) => {
    if (route.meta?.menuItem) {
      if (!adminStore.roles) return false
      else return adminStore.roles.includes(route.meta.requiresRole)
    } else {
      return false
    }
  })
})
</script>

<style scoped>
ion-icon {
  font-size: 32;
}
</style>
