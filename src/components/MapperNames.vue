<template>
  <div v-for="(mapper, index) in mappers" :key="mapper.id">
    <a :href="`https://steamcommunity.com/profiles/${mapper.id}`" class="border-b border-green-400 text-green-400">{{
      mapper.name
    }}</a>
    <span v-if="index < mappers.length - 1" class="text-slate-400">/</span>
  </div>
</template>

<script setup lang="ts">
import { Player } from "../types"

defineProps<{
  mappers: Player[]
}>()
</script>
