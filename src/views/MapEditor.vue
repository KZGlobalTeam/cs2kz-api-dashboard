<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <!-- basic info -->
      <div class="mb-4">
        <p class="mb-2">Workshop ID</p>
        <n-input v-model:value="workshopId" placeholder="123456789" />
      </div>

      <!-- mappers -->
      <p class="my-2">Mappers</p>
      <n-dynamic-input
        v-model:value="mappers"
        item-style="margin-bottom: 1rem;"
        :on-create="onCreateMapper"
        #="{ index }"
      >
        <div class="flex gap-4">
          <n-input
            v-model:value="mappers[index].name"
            placeholder="Name"
            @keydown.enter.prevent
          />

          <n-input
            v-model:value="mappers[index].steam_id"
            placeholder="Steam ID"
            @keydown.enter.prevent
          />
        </div>
      </n-dynamic-input>
    </div>

    <!-- Courses -->
    <div class="p-4 bg-gray-800 rounded-md mb-4">
      <!-- Course X -->
      <div
        v-for="(course, courseIndex) in courses"
        :key="course.id"
        class="p-4 bg-gray-900 border border-slate-600 rounded-md mb-4"
      >
        <!-- Course 1 [Delete] -->
        <div
          class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2"
        >
          <p class="font-medium text-xl">{{ `Course ${courseIndex}` }}</p>
          <n-button
            @click="deleteCourse(courseIndex)"
            text-color="#e2e8f0"
            type="error"
            >Delete</n-button
          >
        </div>

        <!-- Mappers -->
        <div class="mb-4">
          <p class="my-2">Mappers</p>
          <n-dynamic-input
            v-model:value="courses[courseIndex].mappers"
            item-style="margin-bottom: 1rem;"
            :on-create="onCreateMapper"
            #="{ index }"
          >
            <div class="flex gap-4">
              <n-input
                v-model:value="courses[courseIndex].mappers[index].name"
                placeholder="Name"
                @keydown.enter.prevent
              />
              <n-input
                v-model:value="courses[courseIndex].mappers[index].steam_id"
                placeholder="Steam ID"
                @keydown.enter.prevent
              />
            </div>
          </n-dynamic-input>
        </div>

        <!-- Filters [New Filter] -->
        <div
          class="flex items-center justify-between border-b border-slate-600 pb-2 mb-2"
        >
          <p>Filters</p>
        </div>

        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>Mode</th>
              <th>Type</th>
              <th>Tier</th>
              <th>Ranked Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="filter in course.filters" :key="filter.id">
              <td>
                {{ filter.mode === "kz_classic" ? "Classic" : "Vanilla" }}
              </td>
              <td>
                {{ filter.teleports ? "Standard" : "Pro" }}
              </td>
              <td>
                <n-select v-model:value="filter.tier" :options="tierOptions" />
              </td>
              <td>
                <n-select
                  v-model:value="filter.ranked_status"
                  :options="rankedStatusOptions"
                />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <div>
        <n-button @click="createCourse" text-color="#37ab56"
          >New Course</n-button
        >
      </div>
    </div>

    <div class="p-4 bg-gray-800 rounded-md">
      <n-button
        @click.prevent="saveMap"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        text-color="#3cc962"
        size="large"
        strong
        bordered
        >Save</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NInput,
  NButton,
  NSelect,
  NTable,
  NDynamicInput,
  useMessage,
} from "naive-ui"
import type { Mapper, Course, Map } from "../types"
import _ from "lodash"

let newCourseId = -1
let oldMap: Map

const router = useRouter()
const route = useRoute()

const message = useMessage()

const workshopId = ref("")

// mappers input
const mappers = ref<Mapper[]>([{ name: "", steam_id: "" }])

const courses = ref<Course[]>([])

const loading = ref(false)

const tierOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
]
const rankedStatusOptions = [
  { label: "Never", value: "never" },
  { label: "Unranked", value: "unranked" },
  { label: "Ranked", value: "ranked" },
]

onBeforeMount(() => {
  // load map data
  if (route.params.id) {
    fetch(`/map.json`)
      .then((res) => {
        return res.json()
      })
      .then((result: Map) => {
        // save original map data for later comparison
        oldMap = _.cloneDeep(result)

        workshopId.value = result.workshop_id.toString()
        mappers.value = result.mappers
        courses.value = result.courses
      })
  }
})

function onCreateMapper() {
  return {
    name: "",
    steam_id: "",
  }
}

// the stage number will be updated before map is submitted
function createCourse() {
  courses.value.push({
    id: newCourseId--,
    stage: 0,
    filters: [
      {
        id: 1,
        mode: "kz_classic",
        teleports: true,
        tier: 1,
        ranked_status: "unranked",
      },
      {
        id: 2,
        mode: "kz_classic",
        teleports: false,
        tier: 1,
        ranked_status: "unranked",
      },
      {
        id: 3,
        mode: "kz_vanilla",
        teleports: true,
        tier: 1,
        ranked_status: "unranked",
      },
      {
        id: 4,
        mode: "kz_vanilla",
        teleports: false,
        tier: 1,
        ranked_status: "unranked",
      },
    ],
    mappers: [{ name: "", steam_id: "" }],
  })
}

function deleteCourse(courseIndex: number) {
  courses.value.splice(courseIndex, 1)
}

function saveMap() {
  loading.value = true
  // validate map info
  let validated = true

  if (!workshopId.value) {
    message.error("Workshop ID is required")
    validated = false
  }

  if (mappers.value.length === 0) {
    message.error("At least one mapper is required")
    validated = false
  } else {
    mappers.value.forEach((mapper, index) => {
      if (!mapper.steam_id) {
        message.error(`Mapper ${index + 1}: steam id is required`)
        validated = false
      }
    })
  }

  courses.value.forEach((course, courseIndex) => {
    if (course.mappers.length === 0) {
      message.error(`Course ${courseIndex}: at least one mapper is required`)
      validated = false
    } else {
      course.mappers.forEach((mapper, mapperIndex) => {
        if (!mapper.steam_id) {
          message.error(
            `Course ${courseIndex}: mapper ${
              mapperIndex + 1
            }: steam id is required`
          )
          validated = false
        }
      })
    }
  })

  if (validated) {
    try {
      if (route.params.id) {
        updateMap()
      } else {
        createMap()
      }
    } catch (error) {
      console.log(error)
      message.error("Failed to save map", { duration: 3000 })
    }
  } else {
    loading.value = false
  }
}

function createMap() {
  loading.value = true
  const mapToCreate = {
    workshop_id: parseInt(workshopId.value),
    mappers: mappers.value.map((mapper) => mapper.steam_id),
    courses: courses.value.map((course, index) => ({
      stage: index,
      filters: course.filters.map((filter) => ({
        mode: filter.mode,
        teleports: filter.teleports,
        tier: filter.tier,
        ranked_status: filter.ranked_status,
      })),
      mappers: course.mappers.map((mapper) => mapper.steam_id),
    })),
  }

  setTimeout(() => {
    console.log("map created", mapToCreate)
    loading.value = false
    message.success("Map created", { duration: 3000 })
    router.push({
      name: "maps",
    })
  }, 2000)
}

function updateMap() {
  loading.value = true
  // update stage
  courses.value.forEach((course, index) => {
    course.stage = index
  })

  const mapToUpdate = {
    id: oldMap.id,
    workshop_id: parseInt(workshopId.value),

    added_mappers: mappers.value
      .filter(
        (mapper) =>
          !oldMap.mappers.some(
            (oldMapper) => oldMapper.steam_id === mapper.steam_id
          )
      )
      .map((mapper) => mapper.steam_id),

    removed_mappers: oldMap.mappers
      .filter(
        (oldMapper) =>
          !mappers.value.some(
            (mapper) => mapper.steam_id === oldMapper.steam_id
          )
      )
      .map((mapper) => mapper.steam_id),

    added_courses: courses.value
      .filter(
        (course) =>
          !oldMap.courses.some((oldCourse) => oldCourse.id === course.id)
      )
      .map((course) => ({
        stage: course.stage,
        filters: course.filters.map((filter) => ({
          mode: filter.mode,
          teleports: filter.teleports,
          tier: filter.tier,
          ranked_status: filter.ranked_status,
        })),
        mappers: course.mappers.map((mapper) => mapper.steam_id),
      })),

    removed_courses: oldMap.courses
      .filter(
        (oldCourse) =>
          !courses.value.some((course) => course.id === oldCourse.id)
      )
      .map((oldCourse) => oldCourse.id),

    course_updates: courses.value
      .filter((course) =>
        oldMap.courses.some((oldCourse) => oldCourse.id === course.id)
      )
      .map((course) => {
        const oldCourse = oldMap.courses.find(
          (oldCourse) => oldCourse.id === course.id
        )

        if (oldCourse) {
          return {
            id: course.id,
            stage: course.stage,
            filter_updates: course.filters
              .filter((filter, index) => {
                const oldFilter = oldCourse.filters[index]
                return (
                  filter.tier !== oldFilter.tier ||
                  filter.ranked_status !== oldFilter.ranked_status
                )
              })
              .map((filter) => {
                return {
                  id: filter.id,
                  tier: filter.tier,
                  ranked_status: filter.ranked_status,
                }
              }),

            added_mappers: course.mappers
              .filter(
                (mapper) =>
                  !oldCourse.mappers.some(
                    (oldMapper) => oldMapper.steam_id === mapper.steam_id
                  )
              )
              .map((mapper) => mapper.steam_id),

            removed_mappers: oldCourse.mappers
              .filter(
                (oldMapper) =>
                  !course.mappers.some(
                    (mapper) => mapper.steam_id === oldMapper.steam_id
                  )
              )
              .map((mapper) => mapper.steam_id),
          }
        }
      }),
  }

  setTimeout(() => {
    console.log("map updated", mapToUpdate)
    loading.value = false
    message.success("Map created", { duration: 3000 })
    router.push({
      name: "maps",
    })
  }, 2000)
}
</script>

<style scoped>
.saveButton {
  font-size: 16px;
}
</style>
