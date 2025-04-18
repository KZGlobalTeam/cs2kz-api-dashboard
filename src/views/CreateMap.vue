<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo v-model:workshop-id="workshopId" v-model:description="description" v-model:state="state" type="create" />
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
import type { MapState, NewCourses } from "../types"
import { useGameStore } from "../store/game"
import MapInfo from "../components/map/MapInfo.vue"
import Courses from "../components/map/Courses.vue"

const workshopId = defineModel<number>("workshopId", { required: true })
const description = defineModel<string>("description", { required: true })
const state = defineModel<MapState>("state")

const courses = defineModel<NewCourses>("courses", { required: true })

const gameStore = useGameStore()

function createCourse() {
  const indices = Object.keys(courses.value).map((i) => parseInt(i))
  const maxIndex = Math.max(...indices, -1)
  const newIndex = (maxIndex + 1).toString()
  const cs2Course = {
    name: "",
    description: "",
    filters: {
      ckz: {
        nub_tier: "very-easy" as const,
        pro_tier: "very-easy" as const,
        ranked: true,
        notes: "",
      },
      vnl: {
        nub_tier: "very-easy" as const,
        pro_tier: "very-easy" as const,
        ranked: true,
        notes: "",
      },
      game: "cs2" as const,
    },
    mappers: [""],
  }

  const csgoCourse = {
    name: "",
    description: "",
    filters: {
      kzt: {
        nub_tier: "very-easy" as const,
        pro_tier: "very-easy" as const,
        ranked: true,
        notes: "",
      },
      skz: {
        nub_tier: "very-easy" as const,
        pro_tier: "very-easy" as const,
        ranked: true,
        notes: "",
      },
      vnl: {
        nub_tier: "very-easy" as const,
        pro_tier: "very-easy" as const,
        ranked: true,
        notes: "",
      },
      game: "csgo" as const,
    },
    mappers: [""],
  }
  courses.value[newIndex] = gameStore.game === "cs2" ? cs2Course : csgoCourse
}
</script>
