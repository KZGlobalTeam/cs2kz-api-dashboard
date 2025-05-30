<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <MapInfo v-model:map="newMap" type="create" />
    </div>

    <!-- courses -->
    <div class="mb-4 rounded-md bg-gray-800 p-4">
      <Courses v-model:map="newMap" type="create" />
      <n-button @click="createCourse" type="primary" tertiary>New Course</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import type { NewMap } from "../types"
import { useGameStore } from "../store/game"
import MapInfo from "../components/map/MapInfo.vue"
import Courses from "../components/map/Courses.vue"

const newMap = defineModel<NewMap>("newMap", { required: true })

const gameStore = useGameStore()

function createCourse() {
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
  newMap.value.courses.push(gameStore.game === "cs2" ? cs2Course : csgoCourse)
}
</script>
