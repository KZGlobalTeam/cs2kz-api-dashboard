<template>
  <n-table :bordered="false" :single-line="false" size="small">
    <thead>
      <tr>
        <th>Mode</th>
        <th>NUB Tier</th>
        <th>PRO Tier</th>
        <th>State</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <!-- CSGO -->
      <Filter v-if="gameStore.game === 'csgo'" mode-title="KZT" v-model:filter="(filters as NewCSGOFilters).kzt" />
      <Filter v-if="gameStore.game === 'csgo'" mode-title="SKZ" v-model:filter="(filters as NewCSGOFilters).skz" />
      <Filter v-if="gameStore.game === 'csgo'" mode-title="VNL" v-model:filter="(filters as NewCSGOFilters).vnl" />

      <!-- CSGO -->
      <Filter v-if="gameStore.game === 'cs2'" mode-title="CKZ" v-model:filter="(filters as NewCS2Filters).ckz" />
      <Filter v-if="gameStore.game === 'cs2'" mode-title="VNL" v-model:filter="(filters as NewCS2Filters).vnl" />
    </tbody>
  </n-table>
</template>

<script setup lang="ts">
import { NTable } from "naive-ui"
import type { NewFilters, NewCSGOFilters, NewCS2Filters } from "../../types"
import { useGameStore } from "../../store/game"
import Filter from "./Filter.vue"

const filters = defineModel<NewFilters>("filters", { required: true })

const gameStore = useGameStore()
</script>
