<template>
  <div>
    <p class="my-2 font-medium">Mappers</p>
    <n-dynamic-input
      v-model:value="mappers"
      item-style="margin-bottom: 1rem;"
      :on-create="() => ''"
      :min="1"
      #="{ index }"
    >
      <n-input
        v-if="type === 'create'"
        v-model:value="(mappers as NewMappers)[index]"
        placeholder="Steam ID"
        @keydown.enter.prevent
      />
      <div v-if="type === 'update'" class="flex gap-4">
        <n-input v-model:value="(mappers as Mappers)[index].name" placeholder="Steam ID" @keydown.enter.prevent />
        <n-input v-model:value="(mappers as Mappers)[index].id" placeholder="Steam ID" @keydown.enter.prevent />
      </div>
    </n-dynamic-input>
  </div>
</template>

<script setup lang="ts">
import { NInput, NDynamicInput } from "naive-ui"

defineProps<{
  type: "create" | "update"
}>()

type NewMappers = string[]

type Mappers = { id: string; name: string }[]

const mappers = defineModel<NewMappers | Mappers>("mappers", { required: true })
</script>
