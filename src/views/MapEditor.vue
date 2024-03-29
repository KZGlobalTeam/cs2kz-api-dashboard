<template>
  <div>
    <!-- map info -->
    <div class="p-4 bg-gray-800 mb-4 rounded-md">

      <!-- description -->
      <div class="mb-4">
        <p class="mb-2 font-medium">Name</p>
        <n-input v-model:value="name" placeholder="kz_aaaa" />
      </div>

      <!-- workshop -->
      <div class="mb-4">
        <p class="font-medium mb-2">Workshop ID</p>
        <n-input style="margin-bottom: 0.25rem" v-model:value="workshopId" placeholder="123456789" />
        <n-checkbox v-if="editing" size="small" v-model:checked="checkSteam">
          Update Workshop
        </n-checkbox>
      </div>

      <!-- global status -->
      <div class="mb-4">
        <p class="mb-2 font-medium">Global Status</p>
        <n-space>
          <n-radio :checked="globalStatus === 'global'" value="global" @change="handleStatusChange">
            Global
          </n-radio>
          <n-radio :checked="globalStatus === 'in_testing'" value="in_testing" @change="handleStatusChange">
            In Testing
          </n-radio>
          <n-radio :checked="globalStatus === 'not_global'" value="not_global" @change="handleStatusChange">
            Not Global
          </n-radio>
        </n-space>
      </div>

      <!-- description -->
      <div class="mb-4">
        <p class="mb-2 font-medium">Description</p>
        <n-input v-model:value="description" type="textarea" autosize placeholder="" />
      </div>
    </div>

    <!-- mappers -->
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <p class="my-2 font-medium">Mappers</p>
      <n-dynamic-input v-model:value="mappers" item-style="margin-bottom: 1rem;" :on-create="onCreateMapper"
        #="{ index }">
        <div class="flex gap-4">
          <n-input v-model:value="mappers[index].name" placeholder="Name" @keydown.enter.prevent />
          <n-input v-model:value="mappers[index].steam_id" placeholder="Steam ID" @keydown.enter.prevent />
        </div>
      </n-dynamic-input>
    </div>

    <!-- courses -->
    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <div v-for="(course, courseIndex) in courses" :key="course.id"
        class="p-4 bg-gray-900 border border-slate-600 rounded-md mb-4">
        <!-- course name -->
        <div class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2">
          <p class="font-medium text-xl">
            {{ `Course ${courseIndex + 1}` }}
          </p>
          <n-button @click="deleteCourse(courseIndex)" text-color="#e2e8f0" type="error">Delete</n-button>
        </div>

        <div class="mb-4">
          <p class="my-2">Name</p>
          <n-input v-model:value="course.name" placeholder="" />
        </div>

        <!-- mappers -->
        <div class="mb-4">
          <p class="my-2">Mappers</p>
          <n-dynamic-input v-model:value="course.mappers" item-style="margin-bottom: 1rem;" :on-create="onCreateMapper"
            #="{ index }">
            <div class="flex gap-4">
              <n-input v-model:value="course.mappers[index].name" placeholder="Name" @keydown.enter.prevent />
              <n-input v-model:value="course.mappers[index].steam_id" placeholder="Steam ID" @keydown.enter.prevent />
            </div>
          </n-dynamic-input>
        </div>

        <!-- filters -->
        <div class="mb-4">
          <p class="mb-2">Filters</p>
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
              <tr v-for="(filter, filterIndex) in course.filters" :key="filter.id">
                <td>
                  {{ filter.mode === "classic" ? "Classic" : "Vanilla" }}
                </td>
                <td>
                  {{ filter.teleports ? "TP" : "Pro" }}
                </td>
                <td>
                  <select class="bg-[#303033] rounded-sm py-1 px-2"
                    @change="handleTierChange($event, courseIndex, filterIndex)" v-model="filter.tier">
                    <option class="" v-for="option in tierOptions" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </td>
                <td>
                  <select class="bg-[#303033] rounded-sm py-1 px-2" v-model="filter.ranked_status">
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
        </div>

        <!-- description -->
        <div>
          <p class="mb-2">Description</p>
          <n-input type="textarea" v-model:value="course.description" autosize placeholder="" />
        </div>
      </div>
      <!-- if we're creating a new map, then it's allowed -->
      <div v-if="!editing">
        <n-button @click="createCourse" text-color="#37ab56">New Course</n-button>
      </div>
    </div>

    <!-- save map -->
    <div class="p-4 bg-gray-800 rounded-md">
      <n-button @click.prevent="saveMap" :disabled="loading" :loading="loading" class="saveButton" text-color="#3cc962"
        size="large" strong bordered>Save</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NInput,
  NButton,
  NTable,
  NDynamicInput,
  NSpace,
  NRadio,
  NCheckbox,
  useMessage,
  useDialog,
} from "naive-ui"
import type { Player, Course, Map } from "../types"
import { cloneDeep, isEqual, omit } from "lodash-es"
import axiosClient from "../axios"
import { toErrorMsg } from '../utils'
import type { AxiosResponse } from "axios"

let newCourseId = 1
let oldMap: Map

const router = useRouter()
const route = useRoute()

const message = useMessage()
const dialog = useDialog()

const name = ref("")
const workshopId = ref("")
const description = ref("")

// mappers input
const mappers = ref<Player[]>([{ name: "", steam_id: "" }])

const courses = ref<Course[]>([])

const loading = ref(false)
// if the workshop id has changed
// e.g. because someone re-uploaded the map, or the mapper updated the map to fix a bug and uploaded it as a new item
// arguably this logic should be separate from updating the checksum
const globalStatus = ref("global")
const checkSteam = ref(false)

const editing = computed(() => !!route.params.id)

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

onBeforeMount(async () => {
  // load map data
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/maps/${route.params.id}`
      )) as AxiosResponse<Map>
      // console.log(data);

      // save original map data for later comparison
      oldMap = cloneDeep(data)

      globalStatus.value = data.global_status
      name.value = data.name
      workshopId.value = data.workshop_id.toString()
      description.value = data.description || ''
      mappers.value = data.mappers
      courses.value = data.courses
    } catch (error) {
      console.log(error)
    }
  }
})

function onCreateMapper() {
  return {
    name: "",
    steam_id: "",
  }
}

function handleStatusChange(e: Event) {
  globalStatus.value = (e.target as HTMLInputElement).value
}

function handleTierChange(e: Event, courseIndex: number, filterIndex: number) {
  const tier = (e.target as HTMLSelectElement).value as string
  if (tier === 'unfeasible' || tier === 'impossible') {
    nextTick(() => {
      courses.value[courseIndex].filters[filterIndex].ranked_status = 'unranked'
    })
  }
}

// the stage number will be updated before map is submitted
function createCourse() {
  courses.value.push({
    id: newCourseId++,
    // stage: 0,
    name: "",
    description: "",
    filters: [
      {
        id: 1,
        mode: "vanilla",
        teleports: true,
        tier: "very_easy",
        ranked_status: "ranked",
        notes: "",
      },
      {
        id: 2,
        mode: "vanilla",
        teleports: false,
        tier: "very_easy",
        ranked_status: "ranked",
        notes: "",
      },
      {
        id: 3,
        mode: "classic",
        teleports: true,
        tier: "very_easy",
        ranked_status: "ranked",
        notes: "",
      },
      {
        id: 4,
        mode: "classic",
        teleports: false,
        tier: "very_easy",
        ranked_status: "ranked",
        notes: "",
      },
    ],
    mappers: [{ name: "", steam_id: "" }],
  })
}

function deleteCourse(courseIndex: number) {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to delete this course?",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: () => {
      courses.value.splice(courseIndex, 1)
    },
  })
}

function saveMap() {
  loading.value = true
  // validate map info
  let validated = true

  if (!workshopId.value) {
    message.error("Workshop ID is required")
    validated = false
  }

  if (mappers.value.length === 0) {
    message.error("At least one mapper is required")
    validated = false
  } else {
    mappers.value.forEach((mapper, index) => {
      if (!mapper.steam_id) {
        message.error(`Mapper ${index + 1}: steam id is required`)
        validated = false
      }
    })
  }

  if (courses.value.length === 0) {
    message.error('No course created')
  } else {
    courses.value.forEach((course, courseIndex) => {
      if (course.mappers.length === 0) {
        message.error(`Course ${courseIndex + 1}: at least one mapper is required`)
        validated = false
      } else {
        course.mappers.forEach((mapper, mapperIndex) => {
          if (!mapper.steam_id) {
            message.error(
              `Course ${courseIndex + 1}: Mapper ${mapperIndex + 1
              }: steam id is required`
            )
            validated = false
          }
        })
      }
    })
  }

  if (validated) {
    if (editing.value && oldMap.courses.length === courses.value.length) {
      // map is not mutated regarding the amount of courses
      patchMap()
    } else {
      // map is mutated or a new map
      putMap()
    }
  } else {
    loading.value = false
  }
}

async function putMap() {
  loading.value = true
  const mapToPut = {
    global_status: globalStatus.value,
    workshop_id: parseInt(workshopId.value),
    description: description.value,
    mappers: mappers.value.map((mapper) => mapper.steam_id),
    courses: courses.value.map((course, index) => ({
      stage: index + 1,
      name: course.name || null,
      description: course.description,
      filters: course.filters.map((filter) => (omit(filter, ['id']))),
      mappers: course.mappers.map((mapper) => mapper.steam_id),
    })),
  }

  try {
    console.log("map to put", mapToPut)
    await axiosClient.put("/maps", mapToPut, { withCredentials: true })
    message.success("Map saved", { duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    console.log(error)
    message.error(`Failed to save map: ${toErrorMsg(error)}`, { duration: 5000 })
  } finally {
    loading.value = false
  }
}

async function patchMap() {
  loading.value = true
  // update stage
  // courses.value.forEach((course, index) => {
  //   course.stage = index
  // })

  const mapToPatch = {
    global_status: globalStatus.value,
    description:
      description.value === oldMap.description ? null : description.value,
    workshop_id:
      oldMap.workshop_id === parseInt(workshopId.value)
        ? null
        : parseInt(workshopId.value),

    added_mappers: mappers.value
      .filter(
        (mapper) =>
          !oldMap.mappers.some(
            (oldMapper) => oldMapper.steam_id === mapper.steam_id
          )
      )
      .map((mapper) => mapper.steam_id),

    removed_mappers: oldMap.mappers
      .filter(
        (oldMapper) =>
          !mappers.value.some(
            (mapper) => mapper.steam_id === oldMapper.steam_id
          )
      )
      .map((mapper) => mapper.steam_id),

    course_updates: Object.fromEntries(
      courses.value
        .filter((course) =>
          oldMap.courses.some((oldCourse) => oldCourse.id === course.id)
        )
        .map((course) => {
          const oldCourse = oldMap.courses.find(
            (oldCourse) => oldCourse.id === course.id
          ) as Course

          if (isEqual(oldCourse, course)) {
            return null
          }

          const update = {
            name:
              course.name === oldCourse.name
                ? null
                : course.name,
            description:
              course.description === oldCourse.description
                ? null
                : course.description,

            added_mappers: course.mappers
              .filter(
                (mapper) =>
                  !oldCourse.mappers.some(
                    (oldMapper) => oldMapper.steam_id === mapper.steam_id
                  )
              )
              .map((mapper) => mapper.steam_id),

            removed_mappers: oldCourse.mappers
              .filter(
                (oldMapper) =>
                  !course.mappers.some(
                    (mapper) => mapper.steam_id === oldMapper.steam_id
                  )
              )
              .map((mapper) => mapper.steam_id),

            filter_updates: course.filters
              .filter((filter, index) => {
                const oldFilter = oldCourse.filters[index]
                return (
                  filter.tier !== oldFilter.tier ||
                  filter.ranked_status !== oldFilter.ranked_status ||
                  filter.notes !== oldFilter.notes
                )
              })
              .map((filter) => (omit(filter, ['mode', 'teleports']))),
          }

          return [course.id, update]
        })
        .filter(Boolean) as [key: any, value: any][]
    ),
  }

  try {
    console.log("map to patch", mapToPatch)
    await axiosClient.patch(`/maps/${oldMap.id}`, mapToPatch, { withCredentials: true })
    message.success("Map updated", { duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    console.log(error)
    message.error(`Failed to update map: ${toErrorMsg(error)}`, { duration: 5000 })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.saveButton {
  font-size: 16px;
}
</style>
