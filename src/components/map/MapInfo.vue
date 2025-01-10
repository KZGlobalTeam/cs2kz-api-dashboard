<template>
  <!-- map info -->
  <div>
    <!-- name -->
    <div v-if="updating" class="mb-4">
      <p class="mb-2 font-medium">Name</p>
      <n-input v-model:value="name" placeholder="Optional" />
    </div>

    <!-- workshop -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Workshop ID</p>
      <n-input style="margin-bottom: 0.25rem" v-model:value="workshopId as unknown as string" placeholder="" />
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
          { value: 'global', label: 'Global' },
          { value: 'invalid', label: 'Invalid' },
          { value: 'in_testing', label: 'Testing' },
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NSelect } from "naive-ui"

defineProps<{
  updating: boolean
}>()
const name = defineModel<string>("name")
const workshopId = defineModel<number>("workshopId", { required: true })
const description = defineModel<string>("description")
const state = defineModel<string>("state", { required: true })
</script>
