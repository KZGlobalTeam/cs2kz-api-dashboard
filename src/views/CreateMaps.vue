<template>
  <div>
    <div class="mb-4 flex justify-between">
      <div class="flex gap-4">
        <n-input
          style="max-width: 200px"
          v-model:value="mapTabName"
          @keyup.enter="mapTabName && createMapTab()"
          placeholder="Map name"
        />
        <n-button @click="createMapTab" :disabled="!mapTabName" tertiary type="primary"> + New Map </n-button>
      </div>

      <div class="flex gap-4">
        <n-button @click="loadDraft(false)" :disabled="loading" type="info" tertiary>Load Draft</n-button>

        <n-button @click="saveDraft" :disabled="loading" type="warning" tertiary>Save as Draft</n-button>

        <n-button @click.prevent="saveMaps" type="primary" strong>Create</n-button>
      </div>
    </div>

    <n-tabs
      v-if="mapTabs.length > 0"
      v-model:value="selectedMapName"
      type="card"
      size="small"
      closable
      tab-style="min-width: 80px;"
      @close="closeTab"
    >
      <n-tab-pane v-for="mapTab in mapTabs" :key="mapTab.name" :tab="mapTab.name" :name="mapTab.name">
        <CreateMap
          v-model:workshop-id="mapTab.newMap.workshop_id"
          v-model:description="mapTab.newMap.description"
          v-model:state="mapTab.newMap.state"
          v-model:mappers="mapTab.newMap.mappers"
          v-model:courses="mapTab.newMap.courses"
        />
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="loading" :mask-closable="false" class="bg-gray-700">
      <n-card style="width: 300px">
        <div class="flex items-center gap-2">
          <img src="/icons/loading.svg" class="h-8 w-auto" />
          <span class="font-poppings text-lg font-medium">Creating maps...</span>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue"
import { useRouter } from "vue-router"
import { useStorage } from "@vueuse/core"
import { NInput, NButton, NCard, NModal, NTabs, NTabPane, useNotification } from "naive-ui"
import type { NewMap } from "../types"
import CreateMap from "./CreateMap.vue"
import axiosClient from "../axios"
import { cloneDeep } from "lodash-es"
import { toErrorMsg } from "../utils"

interface MapTab {
  name: string
  newMap: NewMap
}

const router = useRouter()

const notification = useNotification()

const loading = ref(false)

const selectedMapName = ref("")
const mapTabs = ref<MapTab[]>([])

const drafts = useStorage<MapTab[]>("maps-draft", () => [])

const mapTabName = ref("")

loadDraft(true)

function createMapTab() {
  mapTabs.value.push({
    name: mapTabName.value,
    newMap: {
      workshop_id: "",
      description: "",
      state: "approved",
      mappers: [""],
      courses: [],
    },
  })
  selectedMapName.value = mapTabName.value
  mapTabName.value = ""
}

function closeTab(tabName: string) {
  const index = mapTabs.value.findIndex((v) => tabName === v.name)
  mapTabs.value.splice(index, 1)
  const len = mapTabs.value.length
  if (selectedMapName.value === tabName) {
    if (len > 1) {
      selectedMapName.value = mapTabs.value[index].name
    } else if (len === 1) {
      selectedMapName.value = mapTabs.value[0].name
    } else {
      selectedMapName.value = ""
    }
  }
}

function loadDraft(newPage: boolean) {
  if (drafts.value.length > 0) {
    mapTabs.value = cloneDeep(toRaw(drafts.value))
    selectedMapName.value = drafts.value[0].name
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
  if (mapTabs.value.length > 0) {
    drafts.value = cloneDeep(toRaw(mapTabs.value))
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
  let allValidated = true

  for (const map of mapTabs.value) {
    const validated = validateMap(map)
    console.log("validated map", validated)
    if (!validated) {
      allValidated = false
    }
  }

  if (allValidated) {
    loading.value = true

    const promises = []
    for (const map of mapTabs.value) {
      promises.push(createMap(toRaw(map.newMap)))
    }
    try {
      const results = await Promise.allSettled(promises)

      loading.value = false

      let allPassed = true

      const names: string[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]

        if (result.status === "fulfilled") {
          notification.success({
            title: `${mapTabs.value[i].name} created`,
            duration: 3000,
          })

          names.push(mapTabs.value[i].name)
        } else {
          allPassed = false
          notification.error({
            title: mapTabs.value[i].name,
            content: toErrorMsg(result.reason),
          })
        }
      }

      for (const tabName of names) {
        closeTab(tabName)
      }

      if (allPassed) {
        // clear draft
        drafts.value = []
        router.push({
          name: "maps",
        })
      }
    } catch (error: any) {
      console.log(error)
    }
  }
}

function validateMap(map: MapTab) {
  // validate map info
  let validated = true

  if (!map.newMap.workshop_id) {
    notification.error({
      title: map.name,
      content: "Workshop ID is required",
    })
    validated = false
  }

  if (map.newMap.mappers.length === 0) {
    notification.error({
      title: map.name,
      content: "At least one mapper is required",
    })
    validated = false
  } else {
    map.newMap.mappers.forEach((mapper, index) => {
      if (!mapper) {
        notification.error({
          title: map.name,
          content: `Mapper ${index + 1}: Steam ID is required`,
        })
        validated = false
      }
    })
  }

  if (map.newMap.courses.length === 0) {
    notification.error({
      title: map.name,
      content: "No courses created",
    })
  } else {
    map.newMap.courses.forEach((course, courseIndex) => {
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
          if (!mapper) {
            notification.error({
              title: map.name,
              content: `Course ${courseIndex + 1}: Mapper ${mapperIndex + 1}: Steam ID is required`,
            })
            validated = false
          }
        })
      }
    })
  }

  return validated
}

async function createMap(newMap: NewMap) {
  console.log("new map", newMap)
  return axiosClient.put("/maps", { ...newMap, workshop_id: parseInt(newMap.workshop_id) }, { withCredentials: true })
}
</script>
