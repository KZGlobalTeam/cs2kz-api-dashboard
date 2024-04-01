<template>
  <n-table :bordered="false" :single-line="false" size="small">
    <thead>
      <tr>
        <th>Mode</th>
        <th>Type</th>
        <th>Tier</th>
        <th>Ranked Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(filter, index) in filters" :key="filter.id">
        <td>
          {{ filter.mode === "classic" ? "Classic" : "Vanilla" }}
        </td>
        <td>
          {{ filter.teleports ? "TP" : "Pro" }}
        </td>
        <td>
          <select
            class="bg-[#303033] rounded-sm py-1 px-2"
            @change="handleTierChange($event, index)"
            v-model="filter.tier"
          >
            <option
              class=""
              v-for="option in tierOptions"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </td>
        <td>
          <select
            class="bg-[#303033] rounded-sm py-1 px-2"
            v-model="filter.ranked_status"
          >
            <option v-for="option in rankedStatusOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>
        <td>
          <n-input v-model:value="filter.notes" placeholder="" />
        </td>
      </tr>
    </tbody>
  </n-table>
</template>

<script setup lang="ts">
import { nextTick, Ref } from "vue"
import { NTable, NInput } from "naive-ui"
import type { Filter } from "../../types"

const filters = defineModel<Filter[]>("filters") as Ref<Filter[]>

const tierOptions = [
  { label: "Very Easy", value: "very_easy" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Advanced", value: "advanced" },
  { label: "Hard", value: "hard" },
  { label: "Very Hard", value: "very_hard" },
  { label: "Extreme", value: "extreme" },
  { label: "Death", value: "death" },
  { label: "Unfeasible", value: "unfeasible" },
  { label: "Impossible", value: "impossible" },
]
const rankedStatusOptions = [
  { label: "Never", value: "never" },
  { label: "Unranked", value: "unranked" },
  { label: "Ranked", value: "ranked" },
]

function handleTierChange(e: Event, index: number) {
  const tier = (e.target as HTMLSelectElement).value as string
  if (tier === "unfeasible" || tier === "impossible") {
    nextTick(() => {
      filters.value[index].ranked_status = "unranked"
    })
  }
}
</script>
