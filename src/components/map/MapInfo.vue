<template>
  <!-- map info -->
  <div>
    <!-- name -->
    <p v-if="updating" class="mb-4 text-2xl font-medium">
      {{ name }}
    </p>

    <!-- workshop -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Workshop ID</p>
      <n-input style="margin-bottom: 0.25rem" v-model:value="workshopId" placeholder="" />
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Description</p>
      <n-input v-model:value="description" type="textarea" autosize placeholder="Optional" />
    </div>

    <!-- global status -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Map State</p>
      <n-select
        v-model:value="state"
        :options="[
          { value: 'approved', label: 'Approved' },
          { value: 'invalid', label: 'Invalid' },
          { value: 'in-testing', label: 'Testing' },
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NSelect } from "naive-ui"

defineProps<{
  name?: string
  updating: boolean
}>()

const workshopId = defineModel<string>("workshopId", { required: true })
const description = defineModel<string>("description")
const state = defineModel<string>("state", { required: true })
</script>
