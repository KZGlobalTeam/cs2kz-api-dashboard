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
        <n-checkbox v-if="route.params.id" size="small" v-model:checked="checkSteam">
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
      <div v-if="!route.params.id">
        <n-button @click="createCourse" text-color="#37ab56">New Course</n-button>
      </div>
    </div>

    <!-- save map -->
    <div class="p-4 bg-gray-800 rounded-md">
      <n-button @click.prevent="saveMap" :disabled="loading" :loading="loading" class="saveButton" text-color="#3cc962"
        style="font-size: 16px" size="large" strong bordered>{{ route.params.id ? 'Update' : 'Create' }}</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, nextTick, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NInput,
  NButton,
  NTable,
  NDynamicInput,
  NSpace,
  NRadio,
  NCheckbox,
  useNotification,
  useDialog,
} from "naive-ui"
import type { Player, Course, Map } from "../types"
import { cloneDeep, isEqual, omit } from "lodash-es"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"
import type { AxiosResponse } from "axios"

let newCourseId = 1
let oldMap: Map

const router = useRouter()
const route = useRoute()

const notification = useNotification()
const dialog = useDialog()

const name = ref("")
const workshopId = ref("")
const description = ref("")

// mappers input
const mappers = ref<Player[]>([{ name: "", steam_id: "", is_banned: false }])

const courses = ref<Course[]>([])

const loading = ref(false)
// if the workshop id has changed
// e.g. because someone re-uploaded the map, or the mapper updated the map to fix a bug and uploaded it as a new item
// arguably this logic should be separate from updating the checksum
const globalStatus = ref("global")
const checkSteam = ref(false)

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
      description.value = data.description || ""
      mappers.value = data.mappers
      courses.value = data.courses
    } catch (error) {
      notification.error({
        title: "Failed to fetch maps",
        content: toErrorMsg(error),
      })
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
  if (tier === "unfeasible" || tier === "impossible") {
    nextTick(() => {
      courses.value[courseIndex].filters[filterIndex].ranked_status = "unranked"
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
    mappers: [{ name: "", steam_id: "", is_banned: false }],
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
    notification.error({
      title: "Missing Fields",
      content: "Workshop ID is required",
    })
    validated = false
  }

  if (mappers.value.length === 0) {
    notification.error({
      title: "Missing Fields",
      content: "At least one mapper is required",
    })
    validated = false
  } else {
    mappers.value.forEach((mapper, index) => {
      if (!mapper.steam_id) {
        notification.error({
          title: "Missing Fields",
          content: `Mapper ${index + 1}: Steam ID is required`,
        })
        validated = false
      }
    })
  }

  if (courses.value.length === 0) {
    notification.error({
      title: "Missing Fields",
      content: "No courses created",
    })
  } else {
    courses.value.forEach((course, courseIndex) => {
      if (course.mappers.length === 0) {
        notification.error({
          title: "Missing Fields",
          content: `Course ${courseIndex + 1}: At least one mapper is required`,
        })
        validated = false
      } else {
        course.mappers.forEach((mapper, mapperIndex) => {
          if (!mapper.steam_id) {
            notification.error({
              title: "Missing Fields",
              content: `Course ${courseIndex + 1}: Mapper ${mapperIndex + 1
                }: Steam ID is required`,
            })
            validated = false
          }
        })
      }
    })
  }

  if (validated) {
    if (route.params.id && oldMap.courses.length === courses.value.length) {
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
    courses: courses.value.map((course) => ({
      name: course.name || null,
      description: course.description || null,
      filters: course.filters.map((filter) => omit(filter, ["id"])),
      mappers: course.mappers.map((mapper) => mapper.steam_id),
    })),
  }

  try {
    console.log("map to create", mapToPut)
    await axiosClient.put("/maps", mapToPut, { withCredentials: true })
    notification.success({ title: "Map saved", duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    notification.error({
      title: "Failed to save map",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

async function patchMap() {
  loading.value = true

  const update = generateUpdate()

  try {
    console.log("map to patch", update)
    // await axiosClient.patch(`/maps/${oldMap.id}`, update, {
    //   withCredentials: true,
    // })
    notification.success({ title: "Map updated", duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    notification.error({
      title: "Failed to update map",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function generateUpdate(): any {
  const update: any = {}

  if (oldMap.description !== description.value) update.description = description.value

  if (oldMap.workshop_id !== Number(workshopId.value)) update.workshop_id = Number(workshopId.value)

  if (oldMap.global_status !== globalStatus.value) update.global_status = globalStatus.value

  update.check_steam = checkSteam.value

  const oldMappers = new Set(oldMap.mappers.map((mapper) => mapper.steam_id))
  const newMappers = new Set(mappers.value.map((mapper) => mapper.steam_id))
  update.added_mappers = Array.from(
    new Set([...newMappers].filter((x) => !oldMappers.has(x)))
  )
  update.removed_mappers = Array.from(
    new Set([...oldMappers].filter((x) => !newMappers.has(x)))
  )

  update.course_updates = {}
  courses.value.forEach((course, index) => {
    const oldCourse = oldMap.courses[index]

    if (!isEqual(oldCourse, toRaw(course))) {
      const courseUpdate: any = {}

      if (oldCourse.name !== course.name && course.name !== '') courseUpdate.name = course.name

      if (oldCourse.description !== course.description && course.description !== '') courseUpdate.description = course.description

      const oldMappers = new Set(
        oldCourse.mappers.map((mapper) => mapper.steam_id)
      )
      const newMappers = new Set(
        course.mappers.map((mapper) => mapper.steam_id)
      )
      courseUpdate.added_mappers = Array.from(
        new Set([...newMappers].filter((x) => !oldMappers.has(x)))
      )
      courseUpdate.removed_mappers = Array.from(
        new Set([...oldMappers].filter((x) => !newMappers.has(x)))
      )

      courseUpdate.filter_updates = {}
      course.filters.forEach((filter, index) => {
        const oldFilter = oldCourse.filters[index]
        if (!isEqual(oldFilter, toRaw(filter))) {
          const filterUpdate: any = {}

          if (oldFilter.tier !== filter.tier) filterUpdate.tier = filter.tier

          if (oldFilter.ranked_status !== filter.ranked_status) filterUpdate.ranked_status = filter.ranked_status

          if (oldFilter.notes !== filter.notes) filterUpdate.notes = filter.notes

          if (Object.keys(filterUpdate).length > 0) {
            courseUpdate.filter_updates[filter.id] = filterUpdate
          }
        }
      })

      if (Object.keys(courseUpdate).length > 0) {
        update.course_updates[course.id] = courseUpdate
      }
    }
  })

  return update
}
</script>