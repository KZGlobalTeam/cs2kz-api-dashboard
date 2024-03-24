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
          v-model:value="banQuery.reason"
          placeholder="Reason"
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
          v-model:value="banQuery.banned_by"
          placeholder="Banned By"
        />

        <div>
          <n-radio
            :checked="banQuery.unbanned === true"
            @change="handleExpiresChange"
            value="unbanned"
          >
            Unbanned
          </n-radio>
          <n-radio
            :checked="banQuery.unbanned === false"
            @change="handleExpiresChange"
            value="banned"
          >
            Banned
          </n-radio>
        </div>
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
      <n-button text-color="#37ab56" @click="router.push({ name: 'createban' })"
        >New Ban</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import {
  NInput,
  NDataTable,
  NButton,
  NRadio,
  NSpace,
  useMessage,
} from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Ban } from "../types"
import { toLocal, renderSteamID } from "../utils"

type BanQuery = {
  player?: string,
  server?: string | number,
  reason?: string,
  unbanned?: boolean,
  banned_by?: string,
  unbanned_by?: string,
  created_after?: Date,
  created_before?: Date,
}

const router = useRouter()
const message = useMessage()

const loading = ref(false)

const banQuery = reactive<BanQuery>({
  player: "",
  reason: "",
  server: "",
  banned_by: "",
  unbanned: undefined,
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
      return renderSteamID(
        rowData.admin.steam_id,
        rowData.admin.is_banned
      )
    },
  },
  {
    title: "Exipres On",
    key: "expires_on",
    sortOrder: false,
    render(rowData) {
      return toLocal(rowData.expires_on)
    },
    sorter(rowA, rowB) {
      return (
        new Date(rowA.expires_on).getTime() -
        new Date(rowB.expires_on).getTime()
      )
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
      return [
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
                name: "ban",
                params: {
                  id: rowData.id,
                },
              })
            },
          },
          { default: () => "Edit" }
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
          { default: () => "Details" }
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
      // typescript...
      player: banQuery.player || null,
      reason: banQuery.reason || null,
      server: banQuery.server || null,
      banned_by: banQuery.banned_by || null,
      unbanned:
        typeof banQuery.unbanned === "undefined"
          ? null
          : banQuery.unbanned,
    }

    // console.log(params)

    const result = await axiosClient.get("/bans", {
      params,
    })

    data.value = result.data || []
  } catch (error) {
    message.error("Failed to load bans", { duration: 3000 })
    console.log(error)
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  banQuery.player = ""
  banQuery.reason = ""
  banQuery.server = ""
  banQuery.banned_by = ""
  banQuery.unbanned = undefined
  loadBansData()
}

function rowKey(rowData: Ban) {
  return rowData.id
}

function handleExpiresChange(e: Event) {
  banQuery.unbanned = (e.target as HTMLInputElement).value === "unbanned"
  loadBansData()
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
