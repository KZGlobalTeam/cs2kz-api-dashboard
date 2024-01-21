<template>
  <div class="bg-gray-800 rounded-md p-4">
    <!-- selectors -->
    <div class="flex gap-4">
      <n-input
        @input="handleMapSearch"
        type="text"
        v-model:value="searchQuery"
        placeholder="Search"
      >
        <template #prefix>
          <ion-icon name="search-sharp"></ion-icon>
        </template>
      </n-input>
      <n-date-picker
        v-model:value="timestamp"
        placeholder="Release"
        type="month"
        clearable
      />
      <n-button @click="loadMapsData">REFRESH</n-button>
      <n-button text-color="#37ab56" @click="createMap">New Map</n-button>
    </div>

    <!-- maps table -->
    <div class="mt-4">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :pagination="pagination"
        :row-key="rowKey"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed, h } from "vue"
import {
  NInput,
  NDatePicker,
  NDataTable,
  NButton,
  NTag,
  useMessage,
} from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import type { Map, GlobalStatus } from "../types"
import { format } from "date-fns"
import { useRouter } from "vue-router"
import axiosClient from "../axios"

type RowData = {
  id: number
  name: string
  created_on: string
  workshop_id: number
  global_status: GlobalStatus
}
const router = useRouter()
const message = useMessage()

const loading = ref(true)
const data = ref<RowData[]>([])

const filteredData = computed<RowData[]>(() => {
  let resultData = data.value.slice()
  if (searchValue.value) {
    resultData = resultData.filter((v) =>
      v.name.includes(searchValue.value.toLowerCase())
    )
  }
  if (timestamp.value) {
    resultData = resultData.filter((v) => {
      const date = new Date(v.created_on)
      const time = new Date(timestamp.value as number)
      return (
        date.getFullYear() === time.getFullYear() &&
        date.getMonth() === time.getMonth()
      )
    })
  }

  return resultData
})

const searchQuery = ref("")
const searchValue = ref("")
const queryTimeout = ref()

function handleMapSearch() {
  if (queryTimeout.value) clearTimeout(queryTimeout.value)
  queryTimeout.value = setTimeout(() => {
    searchValue.value = searchQuery.value
  }, 500)
}

const columns = ref<DataTableColumn<RowData>[]>([
  {
    type: "expand",
    // expandable: (rowData) => rowData.name !== "Jim Green",
    renderExpand: (rowData) => {
      return h("div", [
        h("p", `Workshop URL`),
        h(
          "a",
          {
            href: `https://steamcommunity.com/sharedfiles/filedetails/?id=${rowData.workshop_id}`,
            target: "_blank",
            class: "text-blue-600 underline",
          },
          {
            default: () =>
              `https://steamcommunity.com/sharedfiles/filedetails/?id=${rowData.workshop_id}`,
          }
        ),
      ])
    },
  },
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
    title: "Status",
    key: "status",
    defaultFilterOptionValues: ["global"],
    filterOptions: [
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
    ],
    filter(value, row) {
      return row.global_status === value
    },
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
    title: "Created",
    key: "created_on",
    sortOrder: false,
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
          onClick: () => editMap(rowData.id),
        },
        { default: () => "Edit" }
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

const timestamp = ref()

onBeforeMount(() => {
  loadMapsData()
})

async function loadMapsData() {
  loading.value = true
  try {
    const result = await axiosClient.get("/maps")
    // console.log(result.data)

    data.value = result.data.map((v: Map) => ({
      id: v.id,
      name: v.name,
      global_status: v.global_status,
      created_on: format(new Date(v.created_on), "yyyy-MM-dd HH:mm:ss"),
      workshop_id: v.workshop_id,
    }))

    loading.value = false
  } catch (error) {
    message.error("Failed to load maps", { duration: 3000 })
    console.log(error)
  }
}

function createMap() {
  router.push({
    name: "createmap",
  })
}

function editMap(id: number) {
  router.push({
    name: "map",
    params: {
      id,
    },
  })
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
