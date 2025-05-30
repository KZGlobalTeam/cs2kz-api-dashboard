<template>
  <!-- map info -->
  <div>
    <!-- name -->
    <p v-if="type === 'update'" class="mb-4 text-2xl font-medium">
      {{ (map as Map).name }}
    </p>

    <!-- workshop id -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Workshop ID</p>
      <n-input-number style="margin-bottom: 0.25rem" v-model:value="map.workshop_id" placeholder="" />
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Description</p>
      <n-input v-model:value="map.description" type="textarea" autosize placeholder="Optional" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewMap, Map } from "../../types"
import { NInputNumber, NInput } from "naive-ui"

defineProps<{
  type: "update" | "create"
}>()

const map = defineModel<Map | NewMap>("map", { required: true })
</script>
