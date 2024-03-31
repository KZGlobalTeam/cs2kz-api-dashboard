<template>
  <div class="bg-gray-800 rounded-md p-4">
    <div class="flex justify-between gap-4 mb-4">
      <!-- filters -->
      <n-space align="center">
        <n-input
          @keyup.enter="loadMapsData"
          type="text"
          v-model:value="mapQuery.name"
          placeholder="Name"
        />

        <n-input
          @keyup.enter="loadMapsData"
          type="text"
          v-model:value="mapQuery.mapper"
          placeholder="Mapper"
        />

        <n-select
          style="width: 8rem"
          @update-value="handleStatusChange"
          v-model:value="mapQuery.globalStatus"
          :options="options"
        />
      </n-space>

      <div class="flex gap-4">
        <n-button @click="loadMapsData"> APPLY FILTER</n-button>
        <n-button @click="clearFilter"> CLEAR </n-button>
      </div>
    </div>

    <!-- maps table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :row-key="rowKey"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button @click="loadMapsData">REFRESH</n-button>
      <n-button text-color="#37ab56" @click="router.push({ name: 'createmap' })"
        >New Map</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeMount, h } from "vue"
import {
  NInput,
  NDataTable,
  NButton,
  NTag,
  NSpace,
  NSelect,
  useNotification,
} from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import type { Map, GlobalStatus } from "../types"
import { useRouter } from "vue-router"
import axiosClient from "../axios"
import { toLocal, renderWorkshopId, toErrorMsg } from "../utils"

type RowData = {
  id: number
  name: string
  created_on: string
  workshop_id: number
  global_status: GlobalStatus
  courseCount: number
}

type MapQuery = {
  name: string
  mapper: string
  globalStatus?: GlobalStatus
}

const router = useRouter()
const notification = useNotification()

const loading = ref(true)
const data = ref<RowData[]>([])

const mapQuery = reactive<MapQuery>({
  name: "",
  mapper: "",
  globalStatus: "global",
})

const options = [
  {
    label: "Global",
    value: "global",
  },
  {
    label: "In Testing",
    value: "in_testing",
  },
  {
    label: "Not Global",
    value: "not_global",
  },
]

const columns = ref<DataTableColumn<RowData>[]>([
  {
    title: "ID",
    key: "id",
    // if its sorted initially
    // 'descend' | 'ascend' | false
    sortOrder: false,
    sorter(rowA, rowB) {
      return rowA.id - rowB.id
    },
  },
  {
    title: "Map",
    key: "name",
    sortOrder: false,
    // use Array.sort
    sorter: "default",
  },
  {
    title: "Workshop",
    key: "workshop_id",
    render(rowData) {
      return renderWorkshopId(rowData.workshop_id)
    },
  },
  {
    title: "Status",
    key: "status",
    render(rowData) {
      return h(
        NTag,
        {
          type:
            rowData.global_status === "global"
              ? "success"
              : rowData.global_status === "in_testing"
              ? "warning"
              : "default",
        },
        {
          default: () =>
            rowData.global_status === "not_global"
              ? "Not Global"
              : rowData.global_status === "in_testing"
              ? "In Testing"
              : "Global",
        }
      )
    },
  },
  {
    title: "Courses",
    key: "courseCount",
  },
  {
    title: "Created",
    key: "created_on",
    sortOrder: false,
    render(rowData) {
      return toLocal(rowData.created_on)
    },
    sorter(rowA, rowB) {
      return (
        new Date(rowA.created_on).getTime() -
        new Date(rowB.created_on).getTime()
      )
    },
  },
  {
    title: "Actions",
    key: "actions",
    render(rowData) {
      return h(
        NButton,
        {
          type: "default",
          textColor: "#e2e8f0",
          size: "tiny",
          onClick: () => {
            router.push({
              name: "map",
              params: {
                id: rowData.id,
              },
            })
          },
        },
        { default: () => "Update" }
      )
    },
  },
])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix(info: PaginationInfo) {
    return `Total: ${info.itemCount} maps`
  },
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

onBeforeMount(() => {
  loadMapsData()
})

async function loadMapsData() {
  loading.value = true
  try {
    const params = {
      // typescript...
      name: mapQuery.name || null,
      mapper: mapQuery.mapper || null,
      global_status: mapQuery.globalStatus || null,
    }

    // console.log(params)

    const result = await axiosClient.get("/maps", { params })
    // console.log(result.data)

    data.value = result.data
      ? result.data.map((v: Map) => ({
          id: v.id,
          name: v.name,
          global_status: v.global_status,
          created_on: v.created_on,
          workshop_id: v.workshop_id,
          courseCount: v.courses.length,
        }))
      : []
  } catch (error) {
    notification.error({title: 'Failed to fetch maps', content: toErrorMsg(error)})
  } finally {
    loading.value = false
  }
}

function handleStatusChange() {
  nextTick(() => {
    loadMapsData()
  })
}

function clearFilter() {
  mapQuery.name = ""
  mapQuery.mapper = ""
  mapQuery.globalStatus = "global"
  loadMapsData()
}

function rowKey(rowData: RowData) {
  return rowData.id
}

function handleSorterChange(sorter: DataTableSortState) {
  columns.value.forEach((column) => {
    if ("sortOrder" in column) {
      if (!sorter) {
        column.sortOrder = false
        return
      }
      if (column.key === sorter.columnKey) column.sortOrder = sorter.order
      else column.sortOrder = false
    }
  })
}
</script>
