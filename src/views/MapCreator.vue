<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <!-- basic info -->
      <n-form
        ref="infoForm"
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
          <n-input v-model:value="info.workshop_id" placeholder="123456789" />
        </n-form-item>
      </n-form>

      <!-- mappers -->
      <n-form :model="mappersModel" ref="mappersForm">
        <p class="mb-2">Mappers</p>
        <n-dynamic-input
          v-model:value="mappersModel.mappers"
          item-style="margin-bottom: 0;"
          :on-create="onCreateMapper"
          :on-remove="onRemoveMapper"
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
                @input="onInputMapperName(index)"
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
                @input="onInputMapperSteamId(index)"
              />
            </n-form-item>
          </div>
        </n-dynamic-input>
      </n-form>
    </div>

    <!-- Courses -->
    <div class="p-4 bg-gray-800 rounded-md mb-4">
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
          :options="mappersOptions"
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

    <div class="p-4 bg-gray-800 rounded-md">
      <n-button
        @click.prevent="saveMap"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        text-color="#3cc962"
        size="large"
        strong
        bordered
        >Save</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NTable,
  NDynamicInput,
  FormInst,
  useMessage,
} from "naive-ui"

type Filter = {
  id: number
  mode: string
  type: string
  tier: number,
}

type Course = {
  filters: Filter[]
  mapperIds: string[]
  id: number
}

let filterId = 0
let courseId = 0

const router = useRouter()

// const message = useMessage()
// name, workshop_id
const info = ref({
  name: "",
  workshop_id: "",
})
const infoForm = ref<FormInst | null>(null)

// mappers input
const mappersModel = ref({ mappers: [{ name: "", steam_id: "" }] })
const mappersForm = ref<FormInst | null>(null)

const courses = ref<Course[]>([
  {
    filters: [
      {
        id: filterId,
        mode: "kz_classic",
        type: "standard",
        tier: 1,
      },
    ],
    mapperIds: [],
    id: courseId,
  },
])

// mapper select options for each course
const mappersOptions = ref<{ label: string; value: string }[]>([
  { label: "", value: "" },
])

const loading = ref(false)

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

function onCreateMapper() {
  mappersOptions.value.push({ label: "", value: "" })
  return {
    name: "",
    steam_id: "",
  }
}

function onRemoveMapper(index: number) {
  mappersOptions.value.splice(index, 1)
}

function onInputMapperName(index: number) {
  mappersOptions.value[index].label = mappersModel.value.mappers[index].name
  // if (inputTimer.value) clearTimeout(inputTimer.value)
  // inputTimer.value = setTimeout(() => {
  //   mappersOptions.value[index].label = mappersModel.value.mappers[index].name
  // }, 500)
}

function onInputMapperSteamId(index: number) {
  mappersOptions.value[index].value = mappersModel.value.mappers[index].steam_id
  // if (inputTimer.value) clearTimeout(inputTimer.value)
  // inputTimer.value = setTimeout(() => {
  //   mappersOptions.value[index].value =
  //     mappersModel.value.mappers[index].steam_id
  // }, 500)
}

// the stage number is based on the index of the course
function createCourse() {
  courses.value.push({
    filters: [
      {
        mode: "kz_classic",
        type: "standard",
        tier: 1,
        id: filterId++,
      },
    ],
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

function saveMap() {
  // validate map info
  infoForm.value?.validate((errors) => {
    if (errors) {
      // message.error("Incomplete map information.")
    } else {
      // validate mappers
      mappersForm.value?.validate((errors) => {
        if (errors) {
          // message.error("Incomplete mapper information.")
        } else {
          // validate courses
          const missingMapper = courses.value.some(
            (course) => course.mapperIds.length === 0
          )

          if (missingMapper) {
            // message.error("Missing mapper information in courses.")
          } else {
            submitMap()
          }
        }
      })
    }
  })
}

function submitMap() {
  loading.value = true
  const mapToCreate = {
    name: info.value.name,
    workshop_id: parseInt(info.value.workshop_id),
    mappers: mappersModel.value.mappers.map((mapper) => mapper.steam_id),
    courses: courses.value.map((course, index) => ({
      stage: index,
      filters: course.filters.map((filter) => ({
        mode: filter.mode,
        teleports: filter.type === "standard" ? true : false,
        tier: filter.tier,
        ranked: false,
      })),
      mappers: course.mapperIds,
    })),
  }

  setTimeout(() => {
    console.log("map created", JSON.stringify(mapToCreate))
    loading.value = false
    // message.success("Map created")
    router.push({
      name: "maps",
    })
  }, 3000)
}
</script>

<style scoped>
.saveButton {
  font-size: 16px;
}
</style>
