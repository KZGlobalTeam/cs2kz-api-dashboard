<template>
  <div>
    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <MapInfo
        v-model:name="name"
        v-model:workshop-id="workshopId"
        v-model:description="description"
        v-model:global-status="globalStatus"
        :updating="false"
      />
    </div>

    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <Mappers v-model:mappers="mappers" />
    </div>

    <!-- courses -->
    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <Courses v-model:courses="courses" />
      <n-button @click="createCourse" text-color="#37ab56">New Course</n-button>
    </div>

    <!-- save map -->
    <div class="p-4 bg-gray-800 rounded-md">
      <n-button
        @click.prevent="saveMap"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        text-color="#3cc962"
        style="font-size: 16px"
        size="large"
        strong
        bordered
        >Create</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { NButton, useNotification } from "naive-ui"
import type { Player, Course } from "../types"
import { omit } from "lodash-es"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"
import MapInfo from "../components/map/MapInfo.vue"
import Mappers from "../components/map/Mappers.vue"
import Courses from "../components/map/Courses.vue"

let newCourseId = 1

const router = useRouter()

const notification = useNotification()

const name = ref("")
const workshopId = ref("")
const description = ref("")
const globalStatus = ref("global")

// mappers input
const mappers = ref<Player[]>([{ name: "", steam_id: "", is_banned: false }])

const courses = ref<Course[]>([])

const loading = ref(false)

// the stage number will be updated before map is submitted
function createCourse() {
  courses.value.push({
    id: newCourseId++,
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

function saveMap() {
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
      if (course.name === "") {
        notification.error({
          title: "Missing Fields",
          content: `Course ${courseIndex + 1}: Course name is required`,
        })
      }
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
              content: `Course ${courseIndex + 1}: Mapper ${
                mapperIndex + 1
              }: Steam ID is required`,
            })
            validated = false
          }
        })
      }
    })
  }

  if (validated) {
    createMap()
  }
}

async function createMap() {
  loading.value = true
  const mapToCreate = {
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
    console.log("map to create", mapToCreate)
    await axiosClient.put("/maps", mapToCreate, { withCredentials: true })
    notification.success({ title: "Map saved", duration: 3000 })
    router.push({
      name: "maps",
    })
  } catch (error: any) {
    loading.value = false
    notification.error({
      title: "Failed to save map",
      content: toErrorMsg(error),
    })
  }
}
</script>
