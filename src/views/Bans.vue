<template>
  <div class="bg-gray-800 rounded-md p-4">
    <div class="flex justify-between gap-4 mb-4">
      <!-- filters -->
      <n-space align="center">
        <n-input
          @keyup.enter="loadBansData"
          type="text"
          v-model:value="banQuery.player"
          placeholder="Player"
        />

        <n-input
          @keyup.enter="loadBansData"
          type="text"
          v-model:value="banQuery.server"
          placeholder="Server"
        />

        <n-input
          @keyup.enter="loadBansData"
          type="text"
          v-model:value="banQuery.bannedBy"
          placeholder="Banned By"
        />

        <n-input
          @keyup.enter="loadBansData"
          type="text"
          v-model:value="banQuery.unbannedBy"
          placeholder="Unbanned By"
        />

        <n-select
          style="width: 8rem"
          @update-value="nextTick(loadBansData)"
          v-model:value="banQuery.reason"
          :options="banReasonOptions"
          placeholder="Ban Reason"
        />

        <n-select
          style="width: 8rem"
          @update-value="nextTick(loadBansData)"
          v-model:value="banQuery.status"
          :options="statusOptions"
          placeholder="Status"
        />

        <n-date-picker
          @update-value="nextTick(loadBansData)"
          v-model:value="banQuery.dateRange"
          type="daterange"
          clearable
        />
      </n-space>

      <div class="flex gap-4">
        <n-button @click="loadBansData"> APPLY FILTER</n-button>
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
      <n-button @click="loadBansData">REFRESH</n-button>
      <n-button
        type="error"
        secondary
        @click="router.push({ name: 'createban' })"
        >New Ban</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount, nextTick } from "vue"
import { useRouter } from "vue-router"
import {
  NInput,
  NDataTable,
  NButton,
  NSpace,
  NSelect,
  NDatePicker,
  NTag,
  useNotification,
} from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Ban } from "../types"
import { toLocal, renderSteamID, toErrorMsg } from "../utils"

interface BanQuery {
  player?: string
  server?: string
  bannedBy?: string
  unbannedBy?: string
  reason?: string | null
  status?: string | null
  dateRange: [number, number]
}

const router = useRouter()
const notification = useNotification()

const banReasonOptions = [
  { label: "Auto Bhop", value: "auto_bhop" },
  { label: "Auto Strafe", value: "auto_strafe" },
]

const statusOptions = [
  { label: "Banned", value: "banned" },
  { label: "Unbanned", value: "unbanned" },
]

const loading = ref(false)

const banQuery = reactive<BanQuery>({
  player: "",
  server: "",
  bannedBy: "",
  unbannedBy: "",
  reason: null,
  status: null,
  dateRange: [1183135260000, Date.now()],
})

const columns = ref<DataTableColumn<Ban>[]>([
  {
    title: "ID",
    key: "id",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "Name",
    key: "name",
    render(rowData) {
      return rowData.player.name
    },
  },
  {
    title: "Steam ID",
    key: "steam_id",
    render(rowData) {
      return renderSteamID(rowData.player.steam_id, true)
    },
  },
  {
    title: "Reason",
    key: "reason",
    render(rowData) {
      return rowData.reason
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    },
  },
  {
    title: "Status",
    key: "status",
    render(rowData) {
      return h(
        NTag,
        {
          type: rowData.unban ? "success" : "error",
        },
        {
          default: () => (rowData.unban ? "unbanned" : "banned"),
        },
      )
    },
  },
  {
    title: "Server",
    key: "server",
    render(rowData) {
      return rowData.server?.name || "-"
    },
  },
  {
    title: "Banned By",
    key: "banned_by",
    render(rowData) {
      return rowData.admin ? rowData.admin.name : "Anticheat"
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
    title: "Exipres On",
    key: "expires_on",
    sortOrder: false,
    render(rowData) {
      return rowData.expires_on ? toLocal(rowData.expires_on) : "-"
    },
  },
  {
    title: "Actions",
    key: "actions",
    render(rowData) {
      return [
        !rowData.unban &&
          h(
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
                  name: "updateban",
                  params: {
                    id: rowData.id,
                  },
                })
              },
            },
            { default: () => "Update" },
          ),
        !rowData.unban &&
          h(
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
                  name: "unban",
                  params: {
                    id: rowData.id,
                  },
                })
              },
            },
            { default: () => "Unban" },
          ),
        h(
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
                name: "bandetails",
                params: {
                  id: rowData.id,
                },
              })
            },
          },
          { default: () => "Details" },
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
    return `Total: ${info.itemCount} bans`
  },
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

const data = ref<Ban[]>([])

onBeforeMount(() => {
  loadBansData()
})

async function loadBansData() {
  loading.value = true
  try {
    const params = {
      player: banQuery.player || null,
      server: banQuery.server || null,
      banned_by: banQuery.bannedBy || null,
      unbanned_by: banQuery.unbannedBy || null,
      reason: banQuery.reason,
      unbanned:
        banQuery.status === null
          ? null
          : banQuery.status === "banned"
            ? false
            : true,
      created_after: new Date(banQuery.dateRange[0]).toISOString(),
      created_before: new Date(banQuery.dateRange[1]).toISOString(),
    }

    const { data: res } = await axiosClient.get("/bans", {
      params,
    })

    data.value = res?.results || []
  } catch (error) {
    notification.error({
      title: "Failed to fetch bans",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  banQuery.player = ""
  banQuery.server = ""
  banQuery.bannedBy = ""
  banQuery.unbannedBy = ""
  banQuery.reason = null
  banQuery.status = null
  banQuery.dateRange = [1183135260000, Date.now()]
  loadBansData()
}

function rowKey(rowData: Ban) {
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
