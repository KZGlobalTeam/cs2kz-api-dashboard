<template>
  <n-button size="tiny" secondary :type="type">
    <template #icon>
      <img :src="`/icons/${iconName}.svg`" class="h-auto w-4" />
    </template>
  </n-button>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import type { Type } from "naive-ui/es/button/src/interface"

defineProps<{
  iconName: string
  type?: Type
}>()
</script>
