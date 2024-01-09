<template>
  <div class="bg-gray-800 rounded-md p-4 text-slate-200">
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
        @update:sorter="handleSorterChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed, h } from "vue"
import { NInput, NDatePicker, NDataTable, NButton } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import type { Map } from "../types"
import { format } from "date-fns"
import { useRouter } from "vue-router"
import axiosClient from "../axios"

type RowData = {
  id: number
  name: string
  created_on: string
  updated_on: string
  workshop_id: number
}
const router = useRouter()

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
    title: "Updated",
    key: "updated_on",
    sortOrder: "descend",
    sorter(rowA, rowB) {
      return (
        new Date(rowA.updated_on).getTime() -
        new Date(rowB.updated_on).getTime()
      )
    },
  },
  {
    title: "Actions",
    key: "actions",
    render(rowData: RowData) {
      return h("div", { class: "flex gap-2" }, [
        h(
          NButton,
          {
            type: "default",
            textColor: "#e2e8f0",
            size: "small",
            onClick: () => goToMap(rowData.id),
          },
          { default: () => "Edit" }
        ),
        h(
          NButton,
          {
            type: "error",
            textColor: "#e2e8f0",
            size: "small",
            onClick: () => deleteMap(rowData.id),
          },
          { default: () => "Delete" }
        ),
      ])
    },
  },
])

const pagination = reactive({
  page: 1,
  pageSize: 3,
  showSizePicker: true,
  pageSizes: [1, 2, 3],
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
      created_on: format(new Date(v.created_on), "yyyy-MM-dd HH:mm:ss"),
      updated_on: format(new Date(v.updated_on), "yyyy-MM-dd HH:mm:ss"),
      workshop_id: v.workshop_id,
    }))
    
    loading.value = false
  } catch (error) {
    console.log(error)
  }
  // fetch("/maps.json")
  //   .then((res) => {
  //     return res.json()
  //   })
  //   .then((result: Map[]) => {
  //     data.value = result.map((v) => ({
  //       id: v.id,
  //       name: v.name,
  //       created_on: format(new Date(v.created_on), "yyyy-MM-dd HH:mm:ss"),
  //       updated_on: format(new Date(v.updated_on), "yyyy-MM-dd HH:mm:ss"),
  //       workshop_id: v.workshop_id,
  //     }))
  //     loading.value = false
  //   })
}

function createMap() {
  router.push({
    name: "createmap",
  })
}

function goToMap(id: number) {
  router.push({
    name: "map",
    params: {
      id,
    },
  })
}

function deleteMap(id: number) {
  console.log("delete map", id)
  // TODO: delete map
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
