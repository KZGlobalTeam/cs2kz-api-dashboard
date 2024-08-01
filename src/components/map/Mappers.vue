<template>
  <div>
    <p class="my-2 font-medium">Mappers</p>
    <n-dynamic-input
      v-model:value="mappers"
      item-style="margin-bottom: 1rem;"
      :on-create="onCreateMapper"
      #="{ index }"
    >
      <div class="flex gap-4">
        <n-input
          v-model:value="mappers[index].name"
          placeholder="Name"
          @keydown.enter.prevent
        />
        <n-input
          v-model:value="mappers[index].steam_id"
          placeholder="Steam ID"
          @keydown.enter.prevent
        />
      </div>
    </n-dynamic-input>
  </div>
</template>

<script setup lang="ts">
import { NInput, NDynamicInput } from "naive-ui"
import type { Mapper } from "../../types"

const mappers = defineModel<Mapper[]>("mappers", { required: true })

function onCreateMapper() {
  return {
    name: "",
    steam_id: "",
  }
}
</script>
