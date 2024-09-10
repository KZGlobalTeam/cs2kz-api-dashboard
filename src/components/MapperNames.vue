<template>
  <div v-for="(mapper, index) in mappers64" :key="mapper.steamId64">
    <a
      :href="`https://steamcommunity.com/profiles/${mapper.steamId64}`"
      class="border-b border-green-400 text-green-400"
      >{{ mapper.name }}</a
    >
    <span v-if="index < mappers64.length - 1" class="text-slate-400">/</span>
  </div>
</template>

<script setup lang="ts">
import { Mapper } from "../types"
import SteamID from "steamid"

const props = defineProps<{
  mappers: Mapper[]
}>()

const mappers64 = props.mappers.map((mapper) => ({
  name: mapper.name,
  steamId64: new SteamID(mapper.steam_id).toString(),
}))
</script>
