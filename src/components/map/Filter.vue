<template>
  <tr>
    <td>{{ modeTitle }}</td>

    <td>
      <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filter.nub_tier">
        <option class="" v-for="option in tierOptions" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </td>

    <td>
      <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filter.pro_tier">
        <option class="" v-for="option in tierOptions" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </td>

    <td>
      <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filter.ranked">
        <option v-for="option in filterStateOptions" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </td>

    <td>
      <n-input v-model:value="filter.notes" placeholder="Optional" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { NInput } from "naive-ui"
import type { NewFilter } from "../../types"

defineProps<{
  modeTitle: string
}>()

const filter = defineModel<NewFilter>("filter", { required: true })

const tierOptions = [
  { label: "Very Easy", value: "very-easy" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Advanced", value: "advanced" },
  { label: "Hard", value: "hard" },
  { label: "Very Hard", value: "very-hard" },
  { label: "Extreme", value: "extreme" },
  { label: "Death", value: "death" },
  { label: "Unfeasible", value: "unfeasible" },
  { label: "Impossible", value: "impossible" },
]

const filterStateOptions = [
  { label: "Unranked", value: false },
  { label: "Ranked", value: true },
]
</script>
