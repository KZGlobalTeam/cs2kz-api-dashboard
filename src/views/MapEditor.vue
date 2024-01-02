<template>
  <div v-if="map">
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <!-- basic info -->
      <n-form
        :model="map"
        :rules="rules"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="Map" path="name">
          <n-input v-model:value="map.name" placeholder="kz_aaaa" />
        </n-form-item>
        <n-form-item label="Workshop ID" path="workshop_id">
          <n-input
            v-model:value="map.workshop_id"
            placeholder="123456789"
          />
        </n-form-item>
      </n-form>

      <!-- mappers -->
      <n-form :model="map">
        <p class="mb-2">Mappers</p>
        <n-dynamic-input
          v-model:value="map.mappers"
          item-style="margin-bottom: 0;"
          :on-create="onCreate"
          #="{ index }"
        >
          <div class="flex gap-4">
            <n-form-item
              ignore-path-change
              :show-label="false"
              :path="`mappers[${index}].name`"
              :rule="mapperNameRule"
            >
              <n-input
                v-model:value="map.mappers[index].name"
                placeholder="Name"
                @keydown.enter.prevent
              />
            </n-form-item>
            <n-form-item
              ignore-path-change
              :show-label="false"
              :path="`mappers[${index}].steam_id`"
              :rule="mapperSteamIdRule"
            >
              <n-input
                v-model:value="map.mappers[index].steam_id"
                placeholder="Steam ID"
                @keydown.enter.prevent
              />
            </n-form-item>
          </div>
        </n-dynamic-input>
      </n-form>
    </div>

    <div class="p-4 bg-gray-800 rounded-md">
      <CourseEditor :mappers="map.mappers" :courses="map.courses" />
    </div>
  </div>

  <div v-else>
    loading...
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue"
import { NForm, NFormItem, NInput, NDynamicInput } from "naive-ui"
import CourseEditor from "../components/map/CourseEditor.vue"
import type { Course, Mapper } from "../types"
import _ from 'lodash'

type Map = {
  id: number
  name: string
  filesize: number
  workshop_id: string
  courses: Course[]
  mappers: Mapper[]
  created_on: string
  updated_on: string
}

const map = ref<Map>()

const oldMap = ref<Map>()

const mapData = {
  courses: [
    {
      filters: [
        {
          teleports: true,
          mode: "kz_classic",
          ranked: true,
          tier: 3,
        },
        {
          teleports: false,
          mode: "kz_classic",
          ranked: true,
          tier: 4,
        },
      ],
      id: 1,
      mappers: [
        {
          name: "GameChaos",
          steam_id: "STEAM_1:0:102468802",
        },
      ],
      stage: 0,
    },
  ],
  created_on: "2023-12-10T10:41:01Z",
  filesize: 190335000,
  id: 1,
  mappers: [
    {
      name: "GameChaos",
      steam_id: "STEAM_1:0:102468802",
    },
  ],
  name: "kz_checkmate",
  updated_on: "2023-12-10T10:41:01Z",
  workshop_id: 3070194623,
}

const rules = {
  name: {
    required: true,
    trigger: ["blur", "input"],
    message: "Map name is required.",
  },
  // TODO: validate workshop id
  workshop_id: {
    required: true,
    trigger: ["blur", "input"],
    message: "Invalid workshop id.",
  },
}

const mapperNameRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Name is required.",
}

// TODO: validate steam id
const mapperSteamIdRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Invalid Steam ID.",
}

onBeforeMount(() => {
  map.value = {...mapData, workshop_id: String(mapData.workshop_id)}
  // clone the original map data for later diffing
  oldMap.value = _.cloneDeep(map.value)
})

function onCreate() {
  return {
    name: "",
    steam_id: "",
  }
}
</script>
