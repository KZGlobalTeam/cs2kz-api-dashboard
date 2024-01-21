<template>
  <div class="bg-gray-800 rounded-md p-4">
    <!-- selectors -->
    <div class="flex gap-4">
      <n-input
        @input="handleAdminSearch"
        type="text"
        v-model:value="searchQuery"
        placeholder="Search"
      >
        <template #prefix>
          <ion-icon name="search-sharp"></ion-icon>
        </template>
      </n-input>

      <n-button @click="loadAdminsData">REFRESH</n-button>
      <n-button text-color="#37ab56" @click="createAdmin">New Admin</n-button>
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
import {
  NInput,
  NDataTable,
  NButton,
  NTag,
  useMessage,
  useDialog,
} from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Admin } from "../types"
import SteamId from "steamid"

type RowData = {
  name: string
  steam_id: string
  roles: string[]
}

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)

const searchQuery = ref("")
const searchValue = ref("")
const queryTimeout = ref()

const columns = ref<DataTableColumn<RowData>[]>([
  {
    title: "Name",
    key: "name",
    sortOrder: false,
    sorter: "default",
  },
  {
    title: "Steam ID",
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
    title: "Roles",
    key: "roles",
    defaultFilterOptionValues: ["maps", "servers", "bans", "admin"],
    filterOptions: [
      {
        label: "maps",
        value: "maps",
      },
      {
        label: "servers",
        value: "servers",
      },
      {
        label: "bans",
        value: "bans",
      },
      {
        label: "admin",
        value: "admin",
      },
    ],
    filter(value, row) {
      return row.roles.includes(value as string)
    },
    render(row) {
      const tags = row.roles.map((role) => {
        return h(
          NTag,
          {
            style: {
              marginRight: "6px",
            },
            type: "info",
            bordered: false,
          },
          {
            default: () => role,
          }
        )
      })
      return tags
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
            onClick: () => editAdmin(rowData.steam_id),
          },
          { default: () => "Edit" }
        ),
        h(
          NButton,
          {
            type: "error",
            size: "tiny",
            textColor: "#e2e8f0",
            onClick: () => deleteAdmin(rowData.steam_id),
          },
          { default: () => "Delete" }
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
    return `Total: ${info.itemCount} admins`
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
  if (searchValue.value) {
    resultData = resultData.filter((v) =>
      v.name.includes(searchValue.value.toLowerCase())
    )
  }

  return resultData
})

onBeforeMount(() => {
  loadAdminsData()
})

async function loadAdminsData() {
  loading.value = true
  try {
    const result = await axiosClient.get("/auth/admins")
    // console.log(result.data)

    data.value = result.data.map((v: Admin) => ({
      name: v.name,
      steam_id: v.steam_id,
      roles: v.roles,
    }))

    loading.value = false
  } catch (error) {
    message.error("Failed to load admins", { duration: 3000 })
    console.log(error)
  }
}

function rowKey(rowData: RowData) {
  return rowData.steam_id
}

function handleAdminSearch() {
  if (queryTimeout.value) clearTimeout(queryTimeout.value)
  queryTimeout.value = setTimeout(() => {
    searchValue.value = searchQuery.value
  }, 500)
}

function createAdmin() {
  router.push({
    name: "createadmin",
  })
}

function deleteAdmin(steam_id: string) {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to delete this admin?",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: (): Promise<void> => {
      return new Promise((resolve) => {
        axiosClient
          .delete(`/auth/admins/${steam_id}`)
          .then(() => {
            resolve()
            message.success("Admin removed", { duration: 2000 })
            loadAdminsData()
          })
          .catch((error) => {
            resolve()
            message.error("Failed to remove admin", { duration: 2000 })
            console.log(error)
          })
      })
    },
  })
}

function editAdmin(steam_id: string) {
  router.push({
    name: "admin",
    params: {
      steam_id,
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
