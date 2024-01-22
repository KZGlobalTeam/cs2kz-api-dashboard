<template>
  <div class="bg-gray-800 rounded-md p-4">
    <!-- selectors -->
    <div class="flex justify-between gap-4">
      <div class="flex gap-4">
        <n-input
          type="text"
          v-model:value="searchQuery"
          placeholder="STEAM_1:1:XXXXXXXXXX"
        >
          <template #prefix>
            <ion-icon name="search-sharp"></ion-icon>
          </template>
        </n-input>
        <n-button @click="searchBan"> SEARCH</n-button>
        <n-button @click="clearSearch"> CLEAR </n-button>
      </div>
      <div class="flex gap-4">
        <n-button @click="loadBansData">REFRESH</n-button>
        <n-button text-color="#37ab56" @click="createBan">New Ban</n-button>
      </div>
    </div>

    <!-- maps table -->
    <div class="mt-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, useMessage } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Ban } from "../types"
import SteamId from "steamid"
import { format } from "date-fns"

const router = useRouter()
const message = useMessage()

const loading = ref(false)

const searchQuery = ref("")

const columns = ref<DataTableColumn<Ban>[]>([
  {
    title: "ID",
    key: "id",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "Player ID",
    key: "steam_id",
    render(rowData) {
      const steamId64 = new SteamId(rowData.steam_id).toString()
      return h(
        "a",
        {
          href: `https://steamcommunity.com/profiles/${steamId64}`,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "border-b border-blue-400 text-blue-400",
        },
        {
          default: () => rowData.steam_id,
        }
      )
    },
  },
  {
    title: "Reason",
    key: "reason",
  },
  {
    title: "Banned By",
    key: "banned_by",
    render(rowData) {
      const steamId64 = new SteamId(rowData.banned_by.steam_id).toString()
      return h(
        "a",
        {
          href: `https://steamcommunity.com/profiles/${steamId64}`,
          target: "_blank",
          rel: "noopener noreferrer",
          class: rowData.banned_by.is_banned
            ? "border-b border-red-400 text-red-400"
            : "border-b border-green-400 text-green-400",
        },
        {
          default: () => rowData.banned_by.steam_id,
        }
      )
    },
  },
  {
    title: "Exipres On",
    key: "expires_on",
    sortOrder: false,
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
            onClick: () => editBan(rowData.id),
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
            onClick: () => goToBan(rowData.id),
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
    const result = await axiosClient.get("/bans")
    // console.log(result.data)
    if (result.data) {
      data.value = result.data.map((v: Ban) => ({
        id: v.id,
        steam_id: v.steam_id,
        reason: v.reason,
        server: v.server,
        banned_by: v.banned_by,
        created_on: format(new Date(v.created_on), "yyyy-MM-dd HH:mm:ss"),
        expires_on: format(new Date(v.expires_on), "yyyy-MM-dd HH:mm:ss"),
      }))
    }

    loading.value = false
  } catch (error) {
    message.error("Failed to load bans", { duration: 3000 })
    console.log(error)
  }
}

function rowKey(rowData: Ban) {
  return rowData.id
}

function searchBan() {

}

function clearSearch() {

}

function createBan() {
  router.push({
    name: "createban",
  })
}

function editBan(id: number) {
  router.push({
    name: "ban",
    params: {
      id,
    },
  })
}

function goToBan(id: number) {
  router.push({
    name: "bandetails",
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
