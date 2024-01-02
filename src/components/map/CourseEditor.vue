<template>
  <div>
    <div>
      <n-button @click="createCourse" text-color="#37ab56">New Course</n-button>
    </div>
    <div
      v-for="(course, index) in courses" :key="course.id"
      class="p-4 bg-gray-900 border border-slate-600 rounded-md mt-4"
    >
      <!-- Course 1 [Delete] -->
      <div
        class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2"
      >
        <p class="font-medium text-xl">{{ `Course ${index}` }}</p>
        <n-button @click="deleteCourse(index)" text-color="#e2e8f0" type="error"
          >Delete</n-button
        >
      </div>

      <!-- Mappers -->
      <p class="my-2">Mappers</p>
      <n-select
        multiple
        v-model:value="course.mapperIds"
        :options="mappersOptions[index]"      />

      <!-- Filters [New Filter] -->
      <div
        class="flex items-center justify-between border-b border-slate-600 pb-2 mt-4 mb-2"
      >
        <p>Filters</p>
        <n-button @click="createFilter(index)" size="tiny" text-color="#37ab56"
          >New Filter</n-button
        >
      </div>

      <n-table :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th>Mode</th>
            <th>Type</th>
            <th>Tier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(filter, filterIndex) in course.filters" :key="filter.id">
            <td>
              <n-select v-model:value="filter.mode" :options="modeOptions" />
            </td>
            <td>
              <n-select v-model:value="filter.type" :options="typeOptions" />
            </td>
            <td>
              <n-select v-model:value="filter.tier" :options="tierOptions" />
            </td>
            <td>
              <n-button
                @click="deleteFilter(index, filterIndex)"
                type="error"
                size="small"
                text-color="#e2e8f0"
                >Delete</n-button
              >
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { NButton, NTable, NSelect } from "naive-ui"
import type { Course, Mapper } from "../../types"

const props = defineProps<{
  mappers: Mapper[],
  courses: Course[]
}>()

const emits = defineEmits(['createCourse', 'updateCourse', 'createFilter', 'updateFilter'])


let filterId = 0
let courseId = 0

const modeOptions = [
  { label: "Classic", value: "kz_classic" },
  { label: "Vanilla", value: "kz_vanilla" },
]

const typeOptions = [
  { label: "Standard", value: "standard" },
  { label: "Pro", value: "pro" },
]
const tierOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
]


const mappersOptions = computed(() => {
  return Array(props.courses.length)
    .fill(null)
    .map((_) => {
      return props.mappers.map((mapper) => ({
        label: mapper.name,
        value: mapper.steam_id,
      }))
    })
})

// the stage number is based on the index of the course
function createCourse() {
  // courses.value.push({
  //   filters: [],
  //   mapperIds: [],
  //   id: courseId++,
  // })
  emits('createCourse')
}

function updateCourse() {
  emits('updateCourse', )
}

function deleteCourse(courseIndex: number) {
  courses.value.splice(courseIndex, 1)
}

function createFilter(courseIndex: number) {
  courses.value[courseIndex].filters.push({
    mode: "kz_classic",
    type: "standard",
    tier: 1,
    id: filterId++
  })
}

function deleteFilter(courseIndex: number, filterIndex: number) {
  courses.value[courseIndex].filters.splice(filterIndex, 1)
}
</script>
