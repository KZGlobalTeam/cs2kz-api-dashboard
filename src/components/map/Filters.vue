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
      <!-- classic -->

      <tr>
        <td>Classic</td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.classic.nub_tier">
            <option class="" v-for="option in tierOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.classic.pro_tier">
            <option class="" v-for="option in tierOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.classic.state">
            <option v-for="option in filterStateOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <n-input v-model:value="filters.classic.notes" placeholder="Optional" />
        </td>
      </tr>

      <!-- vanilla -->
      <tr>
        <td>Vanilla</td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.vanilla.nub_tier">
            <option class="" v-for="option in tierOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.vanilla.pro_tier">
            <option class="" v-for="option in tierOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <select class="rounded-sm bg-[#303033] px-2 py-1" v-model="filters.vanilla.state">
            <option v-for="option in filterStateOptions" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </td>

        <td>
          <n-input v-model:value="filters.vanilla.notes" placeholder="Optional" />
        </td>
      </tr>
    </tbody>
  </n-table>
</template>

<script setup lang="ts">
import { NTable, NInput } from "naive-ui"
import type { CourseFilters } from "../../types"

const filters = defineModel<CourseFilters>("filters", { required: true })

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
  { label: "Pending", value: "pending" },
  { label: "Unranked", value: "unranked" },
  { label: "Ranked", value: "ranked" },
]
</script>
