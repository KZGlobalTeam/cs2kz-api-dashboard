<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo
        v-model:name="name"
        v-model:workshop-id="workshopId"
        v-model:check-steam="checkSteam"
        v-model:description="description"
        v-model:global-status="globalStatus"
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
import type { Mapper, Course, Map } from "../types"
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
const workshopId = ref("")
const description = ref("")
const globalStatus = ref("global")
// if someone re-uploaded the map, or the mapper updated the map to fix a bug and uploaded it as a new item
const checkSteam = ref(false)

// mappers input
const mappers = ref<Mapper[]>([])

const courses = ref<Course[]>([])

const loading = ref(false)

onBeforeMount(async () => {
  try {
    const { data } = (await axiosClient.get(
      `/maps/${route.params.id}`,
    )) as AxiosResponse<Map>
    // console.log(data);

    // save original map for generating update
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
  const update: any = {}

  if (oldMap.description !== description.value)
    update.description = description.value

  if (oldMap.workshop_id !== Number(workshopId.value))
    update.workshop_id = Number(workshopId.value)

  if (oldMap.global_status !== globalStatus.value)
    update.global_status = globalStatus.value

  update.check_steam = checkSteam.value

  const oldMappers = new Set(oldMap.mappers.map((mapper) => mapper.steam_id))
  const newMappers = new Set(mappers.value.map((mapper) => mapper.steam_id))

  const added_mappers = Array.from(
    new Set([...newMappers].filter((x) => !oldMappers.has(x))),
  )
  const removed_mappers = Array.from(
    new Set([...oldMappers].filter((x) => !newMappers.has(x))),
  )

  if (added_mappers.length > 0) {
    update.added_mappers = added_mappers
  }
  if (removed_mappers.length > 0) {
    update.removed_mappers = removed_mappers
  }

  // check if courses are changed
  if (!isEqual(oldMap.courses, toRaw(courses.value))) {
    update.course_updates = {}
    courses.value.forEach((course, index) => {
      const oldCourse = oldMap.courses[index]

      // check if each course is changed
      if (!isEqual(oldCourse, toRaw(course))) {
        const courseUpdate: any = {}

        if (oldCourse.name !== course.name && course.name !== "")
          courseUpdate.name = course.name

        if (
          oldCourse.description !== course.description &&
          course.description !== ""
        )
          courseUpdate.description = course.description

        const oldMappers = new Set(
          oldCourse.mappers.map((mapper) => mapper.steam_id),
        )
        const newMappers = new Set(
          course.mappers.map((mapper) => mapper.steam_id),
        )

        const added_mappers = Array.from(
          new Set([...newMappers].filter((x) => !oldMappers.has(x))),
        )
        const removed_mappers = Array.from(
          new Set([...oldMappers].filter((x) => !newMappers.has(x))),
        )

        if (added_mappers.length > 0) {
          courseUpdate.added_mappers = added_mappers
        }
        if (removed_mappers.length > 0) {
          courseUpdate.removed_mappers = removed_mappers
        }

        // check if filters of this course are changed
        if (!isEqual(oldCourse.filters, toRaw(course.filters))) {
          courseUpdate.filter_updates = {}
          course.filters.forEach((filter, index) => {
            const oldFilter = oldCourse.filters[index]
            if (!isEqual(oldFilter, toRaw(filter))) {
              const filterUpdate: any = {}

              if (oldFilter.tier !== filter.tier)
                filterUpdate.tier = filter.tier

              if (oldFilter.ranked_status !== filter.ranked_status)
                filterUpdate.ranked_status = filter.ranked_status

              if (oldFilter.notes !== filter.notes)
                filterUpdate.notes = filter.notes

              if (Object.keys(filterUpdate).length > 0) {
                courseUpdate.filter_updates[filter.id] = filterUpdate
              }
            }
          })
        }

        if (Object.keys(courseUpdate).length > 0) {
          update.course_updates[course.id] = courseUpdate
        }
      }
    })
  }

  return update
}
</script>
