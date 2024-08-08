<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-between gap-4">
      <!-- filters -->
      <n-input
        @keyup.enter="loadServersData"
        type="text"
        v-model:value="serverQuery.name"
        placeholder="Server Name, ID"
      />

      <div class="flex gap-4">
        <n-button @click="loadServersData"> APPLY FILTER</n-button>
        <n-button @click="clearFilter"> CLEAR </n-button>
      </div>
    </div>

    <!-- servers table -->
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
      <n-button @click="loadServersData">REFRESH</n-button>
      <n-button
        type="primary"
        secondary
        @click="router.push({ name: 'createmyserver' })"
        >New Server</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, useNotification } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Server } from "../types"
import { toLocal, toErrorMsg } from "../utils"
import { usePlayerStore } from "../store/player"

type ServerQuery = {
  name: string
}

const router = useRouter()
const notification = useNotification()
const playerStore = usePlayerStore()

const loading = ref(false)

const serverQuery = reactive<ServerQuery>({
  name: "",
})

const columns = ref<DataTableColumn<Server>[]>([
  {
    title: "ID",
    key: "id",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "IP",
    key: "ip_address",
    render(rowData) {
      return `${rowData.host}:${rowData.port}`
    },
  },
  {
    title: "Created On",
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
          style: {
            marginRight: "0.5rem",
          },
          onClick: () => {
            router.push({
              name: "updatemyserver",
              params: {
                id: rowData.id,
              },
            })
          },
        },
        { default: () => "Update" },
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

const data = ref<Server[]>([])

onBeforeMount(() => {
  loadServersData()
})

async function loadServersData() {
  if (playerStore.steamId === "") {
    data.value = []
    return
  }

  loading.value = true
  try {
    const params = {
      name: serverQuery.name || null,
      owned_by: playerStore.steamId,
    }

    // console.log(params)

    const { data: res } = await axiosClient.get("/servers", {
      params,
    })

    data.value = res?.servers || []
  } catch (error) {
    notification.error({
      title: "Failed to fetch servers",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  serverQuery.name = ""
  loadServersData()
}

function rowKey(rowData: Server) {
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
