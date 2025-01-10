<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo
        v-model:name="name"
        v-model:workshop-id="workshopId"
        v-model:description="description"
        v-model:state="state"
        updating
      />
    </div>

    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Mappers v-model:mappers="mappers" />
    </div>

    <!-- courses -->
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Courses :removable="false" v-model:courses="courses" />
    </div>

    <!-- save map -->
    <div class="rounded-md bg-gray-800 p-4">
      <n-button
        @click.prevent="updateMap"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        type="primary"
        strong
        >Update</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, useNotification } from "naive-ui"
import { MapState, type Map, type MapUpdate, type NewCourse } from "../types"
import { cloneDeep, isEqual } from "lodash-es"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"
import type { AxiosResponse } from "axios"
import MapInfo from "../components/map/MapInfo.vue"
import Mappers from "../components/map/Mappers.vue"
import Courses from "../components/map/Courses.vue"

let oldMap: Map

const router = useRouter()
const route = useRoute()

const notification = useNotification()

const name = ref("")
const workshopId = ref(0)
const description = ref("")
const state = ref<MapState>("global")

// mappers input
const mappers = ref<string[]>([])

const courses = ref<NewCourse[]>([])

const loading = ref(false)

onBeforeMount(async () => {
  try {
    const { data } = (await axiosClient.get(`/maps/${route.params.id}`)) as AxiosResponse<Map>
    // console.log(data);

    // save original map for generating update
    oldMap = cloneDeep(data)

    state.value = data.state
    name.value = data.name
    workshopId.value = data.workshop_id
    description.value = data.description || ""
    mappers.value = data.mappers.map((mapper) => mapper.id)
    courses.value = data.courses.map((course) => ({
      ...course,
      mappers: course.mappers.map((mapper) => mapper.id),
    }))
  } catch (error) {
    notification.error({
      title: "Failed to fetch maps",
      content: toErrorMsg(error),
    })
  }
})

async function updateMap() {
  loading.value = true

  try {
    const update = generateUpdate()
    console.log("map to update", update)
    await axiosClient.patch(`/maps/${oldMap.id}`, update, {
      withCredentials: true,
    })

    notification.success({ title: "Map updated", duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    loading.value = false
    notification.error({
      title: "Failed to update map",
      content: toErrorMsg(error),
    })
  }
}

function generateUpdate(): any {
  const update: MapUpdate = {}

  if (oldMap.description !== description.value) update.description = description.value

  if (oldMap.workshop_id !== Number(workshopId.value)) update.workshop_id = Number(workshopId.value)

  if (oldMap.state !== state.value) update.state = state.value

  const oldMappers = new Set(oldMap.mappers.map((mapper) => mapper.id))
  const newMappers = new Set(mappers.value)

  const added_mappers = Array.from(new Set([...newMappers].filter((x) => !oldMappers.has(x))))
  const deleted_mappers = Array.from(new Set([...oldMappers].filter((x) => !newMappers.has(x))))

  if (added_mappers.length > 0) {
    update.added_mappers = added_mappers
  }
  if (deleted_mappers.length > 0) {
    update.deleted_mappers = deleted_mappers
  }

  // check if courses are changed
  if (!isEqual(oldMap.courses, toRaw(courses.value))) {
    courses.value.forEach((course, index) => {
      const oldCourse = oldMap.courses[index]

      // check if each course is changed
      if (!isEqual(oldCourse, toRaw(course))) {
        const courseUpdate: any = {}

        if (oldCourse.name !== course.name && course.name !== "") courseUpdate.name = course.name

        if (oldCourse.description !== course.description && course.description !== "")
          courseUpdate.description = course.description

        const oldMappers = new Set(oldCourse.mappers.map((mapper) => mapper.id))
        const newMappers = new Set(course.mappers)

        const added_mappers = Array.from(new Set([...newMappers].filter((x) => !oldMappers.has(x))))
        const deleted_mappers = Array.from(new Set([...oldMappers].filter((x) => !newMappers.has(x))))

        if (added_mappers.length > 0) {
          courseUpdate.added_mappers = added_mappers
        }
        if (deleted_mappers.length > 0) {
          courseUpdate.deleted_mappers = deleted_mappers
        }

        // check if filters of this course are changed
        const oldFilters = oldCourse.filters
        const newFilters = course.filters
        if (!isEqual(oldFilters, newFilters)) {
          const filterUpdates: any = {}

          const vanillaDiff = extractChanges(oldFilters.vanilla, newFilters.vanilla)
          if (Object.keys(vanillaDiff).length) filterUpdates.vanilla = vanillaDiff

          const classicDiff = extractChanges(oldFilters.classic, newFilters.classic)
          if (Object.keys(classicDiff).length) filterUpdates.classic = classicDiff

          if (Object.keys(filterUpdates).length) {
            courseUpdate.filter_updates = filterUpdates
          }
        }

        if (Object.keys(courseUpdate).length > 0) {
          update.course_updates!.push({ idx: index, ...courseUpdate })
        }
      }
    })
  }

  return update
}

function extractChanges<T extends object>(oldObj: T, newObj: T): Partial<T> {
  const changes: Partial<T> = {}
  for (const key in oldObj) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = newObj[key]
    }
  }
  return changes
}
</script>
