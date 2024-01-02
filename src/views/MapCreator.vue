<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <!-- basic info -->
      <n-form
        :model="info"
        :rules="rules"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="Map" path="name">
          <n-input v-model:value="info.name" placeholder="kz_aaaa" />
        </n-form-item>
        <n-form-item label="Workshop ID" path="workshop_id">
          <n-input
            v-model:value="info.workshop_id"
            placeholder="123456789"
          />
        </n-form-item>
      </n-form>

      <!-- mappers -->
      <n-form :model="mappersModel">
        <p class="mb-2">Mappers</p>
        <n-dynamic-input
          v-model:value="mappersModel.mappers"
          item-style="margin-bottom: 0;"
          :on-create="onCreate"
          #="{ index }"
        >
          <div class="flex gap-4">
            <n-form-item
              ignore-path-change
              :show-label="false"
              :path="`mappers[${index}].name`"
              :rule="mapperNameRule"
            >
              <n-input
                v-model:value="mappersModel.mappers[index].name"
                placeholder="Name"
                @keydown.enter.prevent
              />
            </n-form-item>
            <n-form-item
              ignore-path-change
              :show-label="false"
              :path="`mappers[${index}].steam_id`"
              :rule="mapperSteamIdRule"
            >
              <n-input
                v-model:value="mappersModel.mappers[index].steam_id"
                placeholder="Steam ID"
                @keydown.enter.prevent
              />
            </n-form-item>
          </div>
        </n-dynamic-input>
      </n-form>
    </div>

    <!-- Courses -->
    <div class="p-4 bg-gray-800 rounded-md">
      <div>
        <n-button @click="createCourse" text-color="#37ab56"
          >New Course</n-button
        >
      </div>

      <!-- Course X -->
      <div
        v-for="(course, index) in courses"
        :key="course.id"
        class="p-4 bg-gray-900 border border-slate-600 rounded-md mt-4"
      >
        <!-- Course 1 [Delete] -->
        <div
          class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2"
        >
          <p class="font-medium text-xl">{{ `Course ${index}` }}</p>
          <n-button
            @click="deleteCourse(index)"
            text-color="#e2e8f0"
            type="error"
            >Delete</n-button
          >
        </div>

        <!-- Mappers -->
        <p class="my-2">Mappers</p>
        <n-select
          multiple
          v-model:value="course.mapperIds"
          :options="mappersOptions[index]"
        />

        <!-- Filters [New Filter] -->
        <div
          class="flex items-center justify-between border-b border-slate-600 pb-2 mt-4 mb-2"
        >
          <p>Filters</p>
          <n-button
            @click="createFilter(index)"
            size="tiny"
            text-color="#37ab56"
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
            <tr
              v-for="(filter, filterIndex) in course.filters"
              :key="filter.id"
            >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NTable,
  NDynamicInput,
} from "naive-ui"

const info = ref({
  name: null,
  workshop_id: null,
})

const mappersModel = ref({ mappers: [{ name: "", steam_id: "" }] })

const rules = {
  name: {
    required: true,
    trigger: ["blur", "input"],
    message: "Map name is required.",
  },
  // TODO: validate workshop id
  workshop_id: {
    required: true,
    trigger: ["blur", "input"],
    message: "Invalid workshop id.",
  },
}

const mapperNameRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Name is required.",
}

// TODO: validate steam id
const mapperSteamIdRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Invalid Steam ID.",
}

function onCreate() {
  return {
    name: "",
    steam_id: "",
  }
}

// courses stuff
type Filter = {
  id: number
  mode: string
  type: string
  tier: number
}

type Course = {
  filters: Filter[]
  mapperIds: string[]
  id: number
}

// type Mapper = {
//   name: string
//   steam_id: string
// }

const courses = ref<Course[]>([])

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
  return Array(courses.value.length)
    .fill(null)
    .map((_) => {
      return mappersModel.value.mappers.map((mapper) => ({
        label: mapper.name,
        value: mapper.steam_id,
      }))
    })
})

// the stage number is based on the index of the course
function createCourse() {
  courses.value.push({
    filters: [],
    mapperIds: [],
    id: courseId++,
  })
}

function deleteCourse(courseIndex: number) {
  courses.value.splice(courseIndex, 1)
}

function createFilter(courseIndex: number) {
  courses.value[courseIndex].filters.push({
    mode: "kz_classic",
    type: "standard",
    tier: 1,
    id: filterId++,
  })
}

function deleteFilter(courseIndex: number, filterIndex: number) {
  courses.value[courseIndex].filters.splice(filterIndex, 1)
}
</script>
