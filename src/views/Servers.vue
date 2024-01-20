<template>
  <div class="bg-gray-800 rounded-md p-4">
    <!-- selectors -->
    <div class="flex gap-4">
      <n-input
        @input="handleServerSearch"
        type="text"
        v-model:value="searchQuery"
        placeholder="Search by name, ip, owner"
      >
        <template #prefix>
          <ion-icon name="search-sharp"></ion-icon>
        </template>
      </n-input>

      <n-button @click="loadServersData">REFRESH</n-button>
      <n-button text-color="#37ab56" @click="createServer">New Server</n-button>
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
import { ref, reactive, h, computed, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, useMessage } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Server, Player } from "../types"
import SteamId from "steamid"
import { format } from "date-fns"

type RowData = {
  id: number
  name: string
  ip_address: string
  owned_by: Player
  approved_on: string
}

const router = useRouter()
const message = useMessage()

const loading = ref(false)

const searchQuery = ref("")
const searchValue = ref("")
const queryTimeout = ref()

const columns = ref<DataTableColumn<RowData>[]>([
  {
    title: "ID",
    key: "id",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "Name",
    key: "name",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "IP",
    key: "ip_address",
  },
  {
    title: "Owner",
    key: "owned_by",
    render(rowData) {
      const steamId64 = new SteamId(rowData.owned_by.steam_id).toString()
      return h(
        "a",
        {
          href: `https://steamcommunity.com/profiles/${steamId64}`,
          target: "_blank",
          rel: "noopener noreferrer",
          class: rowData.owned_by.is_banned
            ? "border-b border-red-400 text-red-400"
            : "border-b border-green-400 text-green-400",
        },
        {
          default: () => rowData.owned_by.steam_id,
        }
      )
    },
  },
  {
    title: "Approved On",
    key: "approved_on",
    sortOrder: false,
    sorter(rowA, rowB) {
      return (
        new Date(rowA.approved_on).getTime() -
        new Date(rowB.approved_on).getTime()
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
          onClick: () => goToServer(rowData.id),
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
    return `Total: ${info.itemCount} servers`
  },
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

const data = ref<RowData[]>([])

const filteredData = computed<RowData[]>(() => {
  let resultData = data.value.slice()
  const regex = new RegExp(searchValue.value, "i")
  if (searchValue.value) {
    resultData = resultData.filter((v) => {
      return (
        regex.test(v.name) ||
        regex.test(v.ip_address) ||
        regex.test(v.owned_by.steam_id)
      )
    })
  }
  return resultData
})

onBeforeMount(() => {
  loadServersData()
})

async function loadServersData() {
  loading.value = true
  try {
    const result = await axiosClient.get("/servers")
    // console.log(result.data)

    data.value = result.data.map((v: Server) => ({
      id: v.id,
      name: v.name,
      ip_address: v.ip_address,
      owned_by: v.owned_by,
      approved_on: format(new Date(v.approved_on), "yyyy-MM-dd HH:mm:ss"),
    }))

    loading.value = false
  } catch (error) {
    message.error("Failed to load servers", { duration: 3000 })
    console.log(error)
  }
}

function rowKey(rowData: RowData) {
  return rowData.id
}

function handleServerSearch() {
  if (queryTimeout.value) clearTimeout(queryTimeout.value)
  queryTimeout.value = setTimeout(() => {
    searchValue.value = searchQuery.value
  }, 500)
}

function createServer() {
  router.push({
    name: "createserver",
  })
}

function goToServer(id: number) {
  router.push({
    name: "server",
    params: {
      id,
    },
  })
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
