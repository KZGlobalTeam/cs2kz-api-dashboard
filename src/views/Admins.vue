<template>
  <div class="rounded-md bg-gray-800 p-4">
    <!-- selectors -->
    <div class="mb-4 flex gap-4">
      <n-input
        @input="handleAdminSearch"
        type="text"
        v-model:value="searchQuery"
        placeholder="Search"
      >
        <template #prefix>
          <img src="/icons/search.svg" class="h-5 w-5" />
        </template>
      </n-input>
    </div>

    <!-- admins table -->
    <div class="mb-4">
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

    <div class="flex justify-end gap-4">
      <n-button @click="loadAdminsData">REFRESH</n-button>
      <n-button
        type="primary"
        secondary
        @click="router.push({ name: 'createadmin' })"
        >New Admin</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, computed, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, NTag, useNotification } from "naive-ui"
import type {
  DataTableSortState,
  PaginationInfo,
  DataTableColumn,
} from "naive-ui"
import axiosClient from "../axios"
import type { Admin, Permission } from "../types"
import { renderSteamID, toErrorMsg } from "../utils"
import ActionButton from "../components/ActionButton.vue"

type RowData = {
  name: string
  steam_id: string
  permissions: string[]
}

const router = useRouter()
const notification = useNotification()

const loading = ref(false)

const searchQuery = ref("")
const searchValue = ref("")
const queryTimeout = ref()

const columns = ref<DataTableColumn<Admin>[]>([
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
      return renderSteamID(rowData.steam_id)
    },
  },
  {
    title: "Permissions",
    key: "permissions",
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
      return row.permissions.includes(value as Permission)
    },
    render(row) {
      const tags = row.permissions.map((permission) => {
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
            default: () => permission,
          },
        )
      })
      return tags
    },
  },
  {
    title: "Actions",
    key: "actions",
    render(rowData) {
      return h(ActionButton, {
        iconName: "edit",
        onClick: () => {
          router.push({
            name: "updateadmin",
            params: {
              steam_id: rowData.steam_id,
            },
          })
        },
      })
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
  if (searchValue.value) {
    return data.value.filter((v) =>
      v.name.toLowerCase().includes(searchValue.value.toLowerCase()),
    )
  }

  return data.value
})

onBeforeMount(() => {
  loadAdminsData()
})

async function loadAdminsData() {
  loading.value = true
  try {
    const { data: res } = await axiosClient.get("/admins")
    // console.log(result.data)

    data.value = res?.admins || []
  } catch (error) {
    notification.error({
      title: "Failed to fetch admins",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function handleAdminSearch() {
  if (queryTimeout.value) clearTimeout(queryTimeout.value)
  queryTimeout.value = setTimeout(() => {
    searchValue.value = searchQuery.value
  }, 500)
}

function rowKey(rowData: RowData) {
  return rowData.steam_id
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
