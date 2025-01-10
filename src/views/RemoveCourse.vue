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
        :disabled="selectedCourseIds.length === 0 || data.length === 1 || selectedCourseIds.length === data.length"
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
import type { Map, Mapper } from "../types"
import { NDataTable, NButton, useNotification } from "naive-ui"
import type { DataTableColumn, DataTableRowKey } from "naive-ui"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { toErrorMsg } from "../utils"
import MapperNames from "../components/MapperNames.vue"
import { omit } from "lodash-es"

type RowData = {
  id: number
  name: string
  mappers: Mapper[]
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

const selectedCourseIds = ref<number[]>([])

const columns = ref<DataTableColumn<RowData>[]>([
  {
    type: "selection",
  },
  {
    title: "ID",
    key: "id",
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
      id: course.id,
      name: course.name,
      mappers: course.mappers,
      description: course.description || "-",
      tierCKZ: course.filters.find((filter) => filter.mode === "classic" && filter.teleports)!.tier,
      tierVNL: course.filters.find((filter) => filter.mode === "vanilla" && filter.teleports)!.tier,
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
      const courses = map.value.courses.filter((course) => !selectedCourseIds.value.includes(course.id))!

      const newMap = {
        global_status: map.value.global_status,
        workshop_id: map.value.workshop_id,
        description: map.value.description || null,
        mappers: map.value.mappers.map((mapper) => mapper.steam_id),
        courses: courses.map((course) => ({
          name: course.name,
          description: course.description || null,
          filters: course.filters.map((filter) => omit(filter, ["id"])),
          mappers: course.mappers.map((mapper) => mapper.steam_id),
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
  selectedCourseIds.value = rowKeys.map(Number)
}

function rowKey(rowData: RowData) {
  return rowData.id
}

function transformTier(tier: string) {
  return tier
    .split("_")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ")
}
</script>
