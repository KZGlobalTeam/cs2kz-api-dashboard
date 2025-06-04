<template>
  <div v-if="map">
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo v-model:map="map as Map" type="update" />
    </div>

    <!-- courses -->
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Courses v-model:map="map as Map" type="update" />
    </div>

    <!-- save map -->
    <div class="rounded-md bg-gray-800 p-4">
      <n-button @click.prevent="updateMap" class="saveButton" type="primary" strong>Update</n-button>
    </div>

    <n-modal v-model:show="loading" :mask-closable="false" class="bg-gray-700">
      <n-card style="width: 300px">
        <div class="flex items-center gap-2">
          <img src="/icons/loading.svg" class="h-8 w-auto" />
          <span class="font-poppings text-lg font-medium">Updating map...</span>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NModal, NCard, useNotification } from "naive-ui"
import type { Map, NewCS2Filters, NewCSGOFilters } from "../types"
import { cloneDeep, isEqual } from "lodash-es"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"
import type { AxiosResponse } from "axios"
import MapInfo from "../components/map/MapInfo.vue"
import Courses from "../components/map/Courses.vue"

let oldMap: Map

const router = useRouter()
const route = useRoute()

const notification = useNotification()

const map = ref<Map>()

const loading = ref(false)

loadMapData()

async function loadMapData() {
  try {
    const { data } = (await axiosClient.get(`/maps/${route.params.id}`)) as AxiosResponse<Map>
    oldMap = cloneDeep(data)

    map.value = data
  } catch (error) {
    notification.error({
      title: "Failed to fetch map",
      content: toErrorMsg(error),
    })
  }
}

async function updateMap() {
  loading.value = true

  try {
    const update = generateUpdate()
    await axiosClient.patch(`/maps/${oldMap.id}`, update, {
      withCredentials: true,
    })

    notification.success({ title: "Map updated", duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    console.error("update error", error)
    loading.value = false
    notification.error({
      title: "Failed to update map",
      content: toErrorMsg(error),
    })
  }
}

function generateUpdate(): any {
  const update: Record<string, any> = {}

  update.workshop_id = map.value!.workshop_id

  if (oldMap.description !== map.value!.description) update.description = map.value!.description

  // check if courses are modified
  if (!isEqual(oldMap.courses, toRaw(map.value!.courses))) {
    for (let index = 0; index < map.value!.courses.length; index++) {
      const oldCourse = oldMap.courses[index]
      const course = map.value!.courses[index]

      // check if each course is changed
      if (!isEqual(oldCourse, toRaw(course))) {
        const courseUpdate: Record<string, any> = {}

        if (oldCourse.name !== course.name) courseUpdate.name = course.name

        if (oldCourse.description !== course.description) courseUpdate.description = course.description

        const oldMappers = new Set(oldCourse.mappers.map((mapper) => mapper.id))
        const newMappers = new Set(course.mappers.map((mapper) => mapper.id))

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
          const filterUpdates: Record<string, any> = {}

          if (oldMap.game === "cs2") {
            const vanillaDiff = extractChanges((oldFilters as NewCS2Filters).vnl, (newFilters as NewCS2Filters).vnl)
            if (Object.keys(vanillaDiff).length) filterUpdates["vanilla-cs2"] = vanillaDiff

            const classicDiff = extractChanges((oldFilters as NewCS2Filters).ckz, (newFilters as NewCS2Filters).ckz)
            if (Object.keys(classicDiff).length) filterUpdates["classic"] = classicDiff
          }

          if (oldMap.game === "csgo") {
            const vanillaDiff = extractChanges((oldFilters as NewCSGOFilters).vnl, (newFilters as NewCSGOFilters).vnl)
            if (Object.keys(vanillaDiff).length) filterUpdates["vanilla-cs2"] = vanillaDiff

            const kztimerDiff = extractChanges((oldFilters as NewCSGOFilters).kzt, (newFilters as NewCSGOFilters).kzt)
            if (Object.keys(kztimerDiff).length) filterUpdates["kztimer"] = kztimerDiff

            const simplekzDiff = extractChanges((oldFilters as NewCSGOFilters).skz, (newFilters as NewCSGOFilters).skz)
            if (Object.keys(simplekzDiff).length) filterUpdates["simplekz"] = simplekzDiff
          }

          if (Object.keys(filterUpdates).length) {
            courseUpdate.filter_updates = filterUpdates
          }
        }

        if (Object.keys(courseUpdate).length > 0) {
          if (update.course_updates === undefined) {
            update.course_updates = {}
          }
          update.course_updates[index + 1] = courseUpdate
        }
      }
    }
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
