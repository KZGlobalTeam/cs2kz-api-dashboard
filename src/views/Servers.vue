<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-between gap-4">
      <!-- filters -->
      <n-space align="center">
        <n-input
          @keyup.enter="loadServersData"
          type="text"
          v-model:value="serverQuery.name"
          placeholder="Server Name, ID"
        />

        <n-input @keyup.enter="loadServersData" type="text" v-model:value="serverQuery.owner" placeholder="Owner" />
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
      <n-button secondary type="primary" @click="router.push({ name: 'createserver' })">New Server</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, NSpace, NTooltip, useNotification } from "naive-ui"
import type { DataTableSortState, PaginationInfo, DataTableColumn } from "naive-ui"
import axiosClient from "../axios"
import type { Server } from "../types"
import { toLocal, renderSteamID, toErrorMsg } from "../utils"
import ActionButton from "../components/ActionButton.vue"

type ServerQuery = {
  name: string
  owner: string
}

const router = useRouter()
const notification = useNotification()

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
    render(rowData) {
      return `${rowData.host}:${rowData.port}`
    },
  },
  {
    title: "Owner",
    key: "owner_name",
    render(rowData) {
      return rowData.owner.name
    },
  },
  {
    title: "Owner ID",
    key: "owner_id",
    render(rowData) {
      return renderSteamID(rowData.owner.id)
    },
  },
  {
    title: "Created On",
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
      return h(
        NTooltip,
        { trigger: "hover" },
        {
          trigger: () =>
            h(ActionButton, {
              iconName: "edit",
              onClick: () => {
                router.push({
                  name: "updateserver",
                  params: {
                    id: rowData.id,
                  },
                })
              },
            }),
          default: () => "Update",
        },
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
      owned_by: serverQuery.owner || null,
    }

    // console.log(params)

    const { data: res } = await axiosClient.get("/servers", {
      params,
    })

    data.value = res?.values || []
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
