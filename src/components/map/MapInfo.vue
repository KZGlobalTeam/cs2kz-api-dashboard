<template>
  <!-- map info -->
  <div>
    <!-- name -->
    <p v-if="type === 'update'" class="mb-4 text-2xl font-medium">
      {{ name }}
    </p>

    <!-- workshop -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Workshop ID</p>
      <n-input-number style="margin-bottom: 0.25rem" v-model:value="workshopId" placeholder="" />
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Description</p>
      <n-input v-model:value="description" type="textarea" autosize placeholder="Optional" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInputNumber, NInput } from "naive-ui"

defineProps<{
  name?: string
  type: "update" | "create"
}>()

const workshopId = defineModel<number>("workshopId", { required: true })
const description = defineModel<string>("description", { required: true })
</script>
