<template>
  <div>
    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <MapInfo
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
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import type { Course, Mapper, GlobalStatus } from "../types"

import MapInfo from "../components/map/MapInfo.vue"
import Mappers from "../components/map/Mappers.vue"
import Courses from "../components/map/Courses.vue"

let newCourseId = 1

const workshopId = defineModel<string>("workshopId", { required: true })
const description = defineModel<string>("description", { required: true })
const globalStatus = defineModel<GlobalStatus>("globalStatus", {
  required: true,
})

const mappers = defineModel<Mapper[]>("mappers", { required: true })

const courses = defineModel<Course[]>("courses", { required: true })

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
    mappers: [{ name: "", steam_id: "" }],
  })
}
</script>
