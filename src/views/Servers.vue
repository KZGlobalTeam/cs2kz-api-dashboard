<template>
  <div class="bg-gray-800 rounded-md p-4">
    <div class="flex justify-between gap-4 mb-4">
      <!-- filters -->
      <n-space align="center">
        <n-input
          @keyup.enter="loadServersData"
          type="text"
          v-model:value="serverQuery.name"
          placeholder="Server Name, ID"
        />

        <n-input
          @keyup.enter="loadServersData"
          type="text"
          v-model:value="serverQuery.owner"
          placeholder="Owner"
        />
      </n-space>

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
        text-color="#37ab56"
        @click="router.push({ name: 'createserver' })"
        >New Server</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, NSpace, useMessage } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Server } from "../types"
import { toLocal, renderSteamID } from "../utils"

type ServerQuery = {
  name: string
  owner: string
}

const router = useRouter()
const message = useMessage()

const loading = ref(false)

const serverQuery = reactive<ServerQuery>({
  name: "",
  owner: "",
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
  },
  {
    title: "Owner",
    key: "owner_name",
    render(rowData) {
      return rowData.owned_by.name
    },
  },
  {
    title: "Owner ID",
    key: "owner_id",
    render(rowData) {
      return renderSteamID(rowData.owned_by.steam_id)
    },
  },
  {
    title: "Approved On",
    key: "approved_on",
    sortOrder: false,
    render(rowData) {
      return toLocal(rowData.approved_on)
    },
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
          style: {
            marginRight: "0.5rem",
          },
          onClick: () => {
            router.push({
              name: "server",
              params: {
                id: rowData.id,
              },
            })
          },
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

const data = ref<Server[]>([])

onBeforeMount(() => {
  loadServersData()
})

async function loadServersData() {
  loading.value = true
  try {
    const params = {
      // typescript...
      name: serverQuery.name || null,
      owner: serverQuery.owner || null,
    }

    // console.log(params)

    const result = await axiosClient.get("/servers", {
      params,
    })

    data.value = result.data || []
  } catch (error) {
    message.error("Failed to load servers", { duration: 3000 })
    console.log(error)
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  serverQuery.name = ""
  serverQuery.owner = ""
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
