<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo :name="name" v-model:workshop-id="workshopId" v-model:description="description" type="update" />
    </div>

    <!-- courses -->
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Courses v-model:courses="courses" />
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
import { ref, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, useNotification } from "naive-ui"
import type { NewCourses, Map, NewCS2Filters, NewCSGOFilters } from "../types"
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

const name = ref("")
const description = ref("")
const workshopId = ref(0)
const courses = ref<NewCourses | null>(null)

const loading = ref(false)

loadMapData()

async function loadMapData() {
  try {
    const { data } = (await axiosClient.get(`/maps/${route.params.id}`)) as AxiosResponse<Map>
    oldMap = cloneDeep(data)
    name.value = data.name
    description.value = data.description
    workshopId.value = data.workshop_id
    courses.value = Object.fromEntries(
      Object.entries(data.courses).map(([key, course]) => [
        key,
        {
          name: course.name,
          description: course.description,
          mappers: course.mappers.map((mapper) => mapper.id),
          filters: course.filters,
        },
      ]),
    )
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
    console.log("map update", update)
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

  update.workshop_id = workshopId.value

  if (oldMap.description !== description.value) update.description = description.value

  // check if courses are changed
  if (!isEqual(oldMap.courses, toRaw(courses.value))) {
    for (const index in courses.value) {
      const oldCourse = oldMap.courses[index]
      const course = courses.value[index]

      // check if each course is changed
      if (!isEqual(oldCourse, toRaw(course))) {
        const courseUpdate: Record<string, any> = {}

        if (oldCourse.name !== course.name) courseUpdate.name = course.name

        if (oldCourse.description !== course.description) courseUpdate.description = course.description

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
          update.course_updates[parseInt(index) + 1] = courseUpdate
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
