<template>
  <div class="rounded-md bg-gray-800 p-4">
    <!-- course table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loadingMap"
        :row-key="rowKey"
        @update:checked-row-keys="handleCheck"
        size="small"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button
        :disabled="selectedCourseNames.length === 0 || data.length === 1 || selectedCourseNames.length === data.length"
        :loading="loading"
        secondary
        type="error"
        @click="removeCourses"
        >Delete</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, h } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { Map, Player } from "../types"
import { NDataTable, NButton, useNotification } from "naive-ui"
import type { DataTableColumn, DataTableRowKey } from "naive-ui"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { toErrorMsg } from "../utils"
import MapperNames from "../components/MapperNames.vue"

type RowData = {
  key: string
  name: string
  mappers: Player[]
  description: string
  tierCKZ: string
  tierVNL: string
}

const route = useRoute()
const router = useRouter()

const notification = useNotification()

const loadingMap = ref(false)
const loading = ref(false)

const mapName = ref("")
const data = ref<RowData[]>([])

const map = ref<Map>()

const selectedCourseNames = ref<string[]>([])

const columns = ref<DataTableColumn<RowData>[]>([
  {
    type: "selection",
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Mappers",
    key: "mappers",
    render(rowData) {
      return h(MapperNames, { mappers: rowData.mappers })
    },
  },
  {
    title: "Tier(CKZ)",
    key: "ckztp",
    render(rowData) {
      return transformTier(rowData.tierCKZ)
    },
  },
  {
    title: "Tier(VNL)",
    key: "vnltp",
    render(rowData) {
      return transformTier(rowData.tierVNL)
    },
  },
  {
    title: "Description",
    key: "description",
  },
])

onBeforeMount(async () => {
  loadingMap.value = true

  try {
    const { data: res } = (await axiosClient.get(`/maps/${route.params.id}`)) as AxiosResponse<Map>
    // console.log(data);

    map.value = res

    mapName.value = res.name
    data.value = res.courses.map((course) => ({
      key: course.name,
      name: course.name,
      mappers: course.mappers,
      description: course.description || "-",
      tierCKZ: course.filters.classic.nub_tier,
      tierVNL: course.filters.vanilla.nub_tier,
    }))
  } catch (error) {
    notification.error({
      title: "Failed to fetch map",
      content: toErrorMsg(error),
    })
  } finally {
    loadingMap.value = false
  }
})

async function removeCourses() {
  loading.value = true

  try {
    if (map.value) {
      const courses = map.value.courses.filter((course) => !selectedCourseNames.value.includes(course.name))!

      const newMap = {
        workshop_id: map.value.workshop_id,
        description: map.value.description,
        state: map.value.state,
        mappers: map.value.mappers.map((mapper) => mapper.id),
        courses: courses.map((course) => ({
          ...course,
          mappers: course.mappers.map((mapper) => mapper.id),
        })),
      }
      console.log("map to update", newMap)
      await axiosClient.put("/maps", newMap, { withCredentials: true })

      notification.success({ title: "Course removed", duration: 3000 })
      router.push({
        name: "maps",
      })
    }
  } catch (error) {
    loading.value = false
    notification.error({
      title: "Failed to remove course",
      content: toErrorMsg(error),
    })
  }
}

function handleCheck(rowKeys: DataTableRowKey[]) {
  selectedCourseNames.value = rowKeys as string[]
}

function rowKey(rowData: RowData) {
  return rowData.name
}

function transformTier(tier: string) {
  return tier
    .split("_")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ")
}
</script>
