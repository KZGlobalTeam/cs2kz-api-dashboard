<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-between gap-4">
      <!-- filters -->
      <n-space align="center">
        <n-input @keyup.enter="loadMapsData" type="text" v-model:value="mapQuery.name" placeholder="Name" />

        <n-input @keyup.enter="loadMapsData" type="text" v-model:value="mapQuery.mapper" placeholder="Mapper" />

        <n-select
          style="width: 8rem"
          @update-value="handleStatusChange"
          v-model:value="mapQuery.state"
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
      <n-button secondary type="primary" @click="router.push({ name: 'createmaps' })">New Map</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeMount, h } from "vue"
import { NInput, NDataTable, NButton, NTag, NSpace, NSelect, NTooltip, useNotification } from "naive-ui"
import type { DataTableSortState, PaginationInfo, DataTableColumn } from "naive-ui"
import ActionButton from "../components/ActionButton.vue"
import type { Map, MapState } from "../types"
import { useRouter } from "vue-router"
import axiosClient from "../axios"
import { toLocal, renderWorkshopId, toErrorMsg } from "../utils"

type RowData = {
  id: number
  name: string
  approved_at: string
  workshop_id: number
  state: MapState
  courseCount: number
}

type MapQuery = {
  name: string
  mapper: string
  state?: MapState
}

const router = useRouter()
const notification = useNotification()

const loading = ref(true)
const data = ref<RowData[]>([])

const mapQuery = reactive<MapQuery>({
  name: "",
  mapper: "",
  state: "approved",
})

const options = [
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Testing",
    value: "in-testing",
  },
  {
    label: "Invalid",
    value: "invalid",
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
          type: rowData.state === "approved" ? "success" : rowData.state === "in-testing" ? "warning" : "default",
        },
        {
          default: () =>
            rowData.state === "approved" ? "Approved" : rowData.state === "in-testing" ? "Testing" : "Invalid",
        },
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
      return toLocal(rowData.approved_at)
    },
    sorter(rowA, rowB) {
      return new Date(rowA.approved_at).getTime() - new Date(rowB.approved_at).getTime()
    },
  },
  {
    title: "Actions",
    key: "actions",
    render(rowData) {
      return [
        h(
          NTooltip,
          { trigger: "hover" },
          {
            trigger: () =>
              h(ActionButton, {
                iconName: "edit",
                style: {
                  marginRight: "0.5rem",
                },
                onClick: () => {
                  router.push({
                    name: "updatemap",
                    params: {
                      id: rowData.id,
                    },
                  })
                },
              }),
            default: () => "Update",
          },
        ),
        h(
          NTooltip,
          { trigger: "hover" },
          {
            trigger: () =>
              h(ActionButton, {
                iconName: "delete",
                type: "error",
                onClick: () => {
                  router.push({
                    name: "removecourse",
                    params: {
                      id: rowData.id,
                    },
                  })
                },
              }),
            default: () => "Remove Courses",
          },
        ),
      ]
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
      state: mapQuery.state || null,
    }

    // console.log(params)

    const { data: res } = await axiosClient.get("/maps", { params })
    // console.log(result.data)

    data.value = res?.values
      ? res.values.map((v: Map) => ({
          id: v.id,
          name: v.name,
          state: v.state,
          approved_at: v.approved_at,
          workshop_id: v.workshop_id,
          courseCount: v.courses.length,
        }))
      : []
  } catch (error) {
    notification.error({
      title: "Failed to fetch maps",
      content: toErrorMsg(error),
    })
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
  mapQuery.state = "approved"
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
