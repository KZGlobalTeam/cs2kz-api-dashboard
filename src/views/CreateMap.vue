<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo
        v-model:workshop-id="workshopId"
        v-model:description="description"
        v-model:state="state"
        :updating="false"
      />
    </div>

    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Mappers v-model:mappers="mappers" />
    </div>

    <!-- courses -->
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Courses v-model:courses="courses" />
      <n-button @click="createCourse" type="primary" tertiary>New Course</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import type { MapState, NewCourse } from "../types"

import MapInfo from "../components/map/MapInfo.vue"
import Mappers from "../components/map/Mappers.vue"
import Courses from "../components/map/Courses.vue"

const workshopId = defineModel<string>("workshopId", { required: true })
const description = defineModel<string>("description")
const state = defineModel<MapState>("state", {
  required: true,
})

const mappers = defineModel<string[]>("mappers", { required: true })

const courses = defineModel<NewCourse[]>("courses", { required: true })

// the stage number will be updated before map is submitted
function createCourse() {
  courses.value.push({
    name: courses.value.length === 0 ? "Main" : "",
    description: "",
    filters: {
      classic: {
        nub_tier: "very-easy",
        pro_tier: "very-easy",
        state: "ranked",
        notes: "",
      },
      vanilla: {
        nub_tier: "very-easy",
        pro_tier: "very-easy",
        state: "ranked",
        notes: "",
      },
    },
    mappers: [""],
  })
}
</script>
