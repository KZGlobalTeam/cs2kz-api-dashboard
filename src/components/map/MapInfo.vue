<template>
  <!-- map info -->
  <div>
    <!-- name -->
    <div v-if="updating" class="mb-4">
      <p class="mb-2 font-medium">Name</p>
      <n-input v-model:value="name" placeholder="kz_aaaa" />
    </div>

    <!-- workshop -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Workshop ID</p>
      <n-input
        style="margin-bottom: 0.25rem"
        v-model:value="workshopId"
        placeholder="123456789"
      />
      <n-checkbox v-if="updating" size="small" v-model:checked="checkSteam">
        Update Workshop
      </n-checkbox>
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Description</p>
      <n-input
        v-model:value="description"
        type="textarea"
        autosize
        placeholder=""
      />
    </div>

    <!-- global status -->
    <div class="mb-4">
      <p class="mb-2 font-medium">Global Status</p>
      <n-space>
        <n-radio
          :checked="globalStatus === 'global'"
          value="global"
          @change="handleStatusChange"
        >
          Global
        </n-radio>
        <n-radio
          :checked="globalStatus === 'in_testing'"
          value="in_testing"
          @change="handleStatusChange"
        >
          In Testing
        </n-radio>
        <n-radio
          :checked="globalStatus === 'not_global'"
          value="not_global"
          @change="handleStatusChange"
        >
          Not Global
        </n-radio>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NCheckbox, NSpace, NRadio } from "naive-ui"

defineProps<{
  updating: boolean
}>()
const name = defineModel<string>("name")
const workshopId = defineModel<string>("workshopId", { required: true })
const checkSteam = defineModel<boolean>("checkSteam")
const description = defineModel<string>("description", { required: true })
const globalStatus = defineModel<string>("globalStatus", { required: true })

function handleStatusChange(e: Event) {
  globalStatus.value = (e.target as HTMLInputElement).value
}
</script>
