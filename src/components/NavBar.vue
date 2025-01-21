<template>
  <div class="menu min-h-screen bg-gray-800 px-2 py-4">
    <n-menu v-model:value="activeKey" :options="playerStore.menuItems" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { usePlayerStore } from "../store/player"
import { useRoute } from "vue-router"
import { NMenu } from "naive-ui"

const playerStore = usePlayerStore()

const route = useRoute()

const activeKey = ref<string>("home")

watch(
  () => route.name,
  (name) => {
    activeKey.value = name as string
  },
)
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
