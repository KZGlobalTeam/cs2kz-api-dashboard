<template>
  <div>
    <div class="mb-4 flex justify-between">
      <div class="flex gap-4">
        <n-input
          style="max-width: 200px"
          v-model:value="mapTabName"
          @keyup.enter="mapTabName && createMapTab()"
          placeholder="kz_aaaa"
        />
        <n-button
          @click="createMapTab"
          :disabled="!mapTabName"
          tertiary
          type="primary"
        >
          + New Map
        </n-button>
      </div>

      <div class="flex gap-4">
        <n-button
          @click="loadDraft(false)"
          :disabled="loading"
          type="info"
          tertiary
          >Load Draft</n-button
        >

        <n-button @click="saveDraft" :disabled="loading" type="warning" tertiary
          >Save as Draft</n-button
        >

        <n-button
          @click.prevent="saveMaps"
          :disabled="loading"
          :loading="loading"
          type="primary"
          strong
          >Create</n-button
        >
      </div>
    </div>

    <n-tabs
      v-if="maps.length > 0"
      v-model:value="selectedMapName"
      type="card"
      size="small"
      closable
      tab-style="min-width: 80px;"
      @close="closeTab"
    >
      <n-tab-pane
        v-for="map in maps"
        :key="map.name"
        :tab="map.name"
        :name="map.name"
      >
        <CreateMap
          v-model:workshop-id="map.form.workshopId"
          v-model:description="map.form.description"
          v-model:global-status="map.form.globalStatus"
          v-model:mappers="map.form.mappers"
          v-model:courses="map.form.courses"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue"
import { useRouter } from "vue-router"
import { useStorage } from "@vueuse/core"
import {
  NInput,
  NButton,
  NTabs,
  NTabPane,
  NPopconfirm,
  useNotification,
} from "naive-ui"
import type { Mapper, GlobalStatus, Course } from "../types"
import CreateMap from "./CreateMap.vue"
import axiosClient from "../axios"
import { omit, cloneDeep } from "lodash-es"
import { toErrorMsg } from "../utils"

interface Map {
  name: string
  form: MapForm
}

interface MapForm {
  workshopId: string
  description: string
  globalStatus: GlobalStatus
  mappers: Mapper[]
  courses: Course[]
}
const router = useRouter()

const notification = useNotification()

const loading = ref(false)

const selectedMapName = ref("")
const maps = ref<Map[]>([])

const mapsDraft = useStorage<Map[]>("maps-draft", () => [])

const mapTabName = ref("")

loadDraft(true)

function createMapTab() {
  maps.value.push({
    name: mapTabName.value,
    form: {
      workshopId: "",
      description: "",
      globalStatus: "global",
      mappers: [{ name: "", steam_id: "" }],
      courses: [],
    },
  })
  selectedMapName.value = mapTabName.value
  mapTabName.value = ""
}

function closeTab(tabName: string) {
  const index = maps.value.findIndex((v) => tabName === v.name)
  maps.value.splice(index, 1)
  const len = maps.value.length
  if (selectedMapName.value === tabName) {
    if (len > 1) {
      selectedMapName.value = maps.value[index].name
    } else if (len === 1) {
      selectedMapName.value = maps.value[0].name
    } else {
      selectedMapName.value = ""
    }
  }
}

function loadDraft(newPage: boolean) {
  if (mapsDraft.value.length > 0) {
    maps.value = cloneDeep(toRaw(mapsDraft.value))
    selectedMapName.value = maps.value[0].name
  } else {
    if (!newPage) {
      notification.warning({
        title: "You haven't saved any maps",
        duration: 3000,
      })
    }
  }
}

function saveDraft() {
  if (maps.value.length > 0) {
    mapsDraft.value = cloneDeep(toRaw(maps.value))
    notification.success({
      title: "Draft saved",
      duration: 3000,
    })
  } else {
    notification.warning({
      title: "Nothing to save",
      duration: 3000,
    })
  }
}

async function saveMaps() {
  loading.value = true
  let allValidated = true

  for (const map of maps.value) {
    const validated = validateMap(map)
    if (!validated) {
      allValidated = false
    }
  }

  if (allValidated) {
    const promises = []
    for (const map of maps.value) {
      promises.push(createMap(map.form))
    }
    try {
      const results = await Promise.allSettled(promises)

      let allPassed = true

      const names: string[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]

        if (result.status === "fulfilled") {
          notification.success({
            title: `${maps.value[i].name} saved`,
            duration: 3000,
          })

          names.push(maps.value[i].name)
        } else {
          allPassed = false
          notification.error({
            title: maps.value[i].name,
            content: toErrorMsg(result.reason),
          })
        }
      }

      for (const tabName of names) {
        closeTab(tabName)
      }

      if (allPassed) {
        router.push({
          name: "maps",
        })
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  loading.value = false
}

function validateMap(map: Map) {
  // validate map info
  let validated = true

  if (!map.form.workshopId) {
    notification.error({
      title: map.name,
      content: "Workshop ID is required",
    })
    validated = false
  }

  if (map.form.mappers.length === 0) {
    notification.error({
      title: map.name,
      content: "At least one mapper is required",
    })
    validated = false
  } else {
    map.form.mappers.forEach((mapper, index) => {
      if (!mapper.steam_id) {
        notification.error({
          title: map.name,
          content: `Mapper ${index + 1}: Steam ID is required`,
        })
        validated = false
      }
    })
  }

  if (map.form.courses.length === 0) {
    notification.error({
      title: map.name,
      content: "No courses created",
    })
  } else {
    map.form.courses.forEach((course, courseIndex) => {
      if (course.name === "") {
        notification.error({
          title: map.name,
          content: `Course ${courseIndex + 1}: Course name is required`,
        })
        validated = false
      }
      if (course.mappers.length === 0) {
        notification.error({
          title: map.name,
          content: `Course ${courseIndex + 1}: At least one mapper is required`,
        })
        validated = false
      } else {
        course.mappers.forEach((mapper, mapperIndex) => {
          if (!mapper.steam_id) {
            notification.error({
              title: map.name,
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

  return validated
}

async function createMap(mapForm: MapForm) {
  const mapToCreate = {
    global_status: mapForm.globalStatus,
    workshop_id: parseInt(mapForm.workshopId),
    description: mapForm.description,
    mappers: mapForm.mappers.map((mapper) => mapper.steam_id),
    courses: mapForm.courses.map((course) => ({
      name: course.name || null,
      description: course.description || null,
      filters: course.filters.map((filter) => omit(filter, ["id"])),
      mappers: course.mappers.map((mapper) => mapper.steam_id),
    })),
  }

  return axiosClient.put("/maps", mapToCreate, { withCredentials: true })
}
</script>
