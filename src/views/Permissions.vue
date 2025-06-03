<template>
  <div class="rounded-md bg-gray-800 p-4">
    <!-- selectors -->
    <div class="mb-4 flex gap-4">
      <n-input @input="handleUserSearch" type="text" v-model:value="searchQuery" placeholder="Search">
        <template #prefix>
          <img src="/icons/search.svg" class="h-5 w-5" />
        </template>
      </n-input>
    </div>

    <!-- users table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :row-key="(rowData: User) => rowData.id"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button @click="loadUsersData">REFRESH</n-button>
    </div>

    <budget-modal v-model:show="showBudgetModal" :user="activeUser" @update:success="loadUsersData()" />
    <perm-modal v-model:show="showPermModal" :user="activeUser" @update:success="loadUsersData()" />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from "vue"
import { NInput, NDataTable, NButton, NTag, useNotification, useDialog } from "naive-ui"
import type { DataTableSortState, DataTableColumn } from "naive-ui"
import BudgetModal from "../components/permission/BudgetModal.vue"
import PermModal from "../components/permission/PermModal.vue"
import axiosClient from "../axios"
import type { Permission, User } from "../types"
import { renderPlayerName, toErrorMsg } from "../utils"
import { usePlayerStore } from "../store/player"

const permissions = [
  "create-maps",
  "update-maps",
  "modify-server-metadata",
  "modify-server-budgets",
  "reset-server-access-keys",
  "delete-server-access-keys",
  "create-bans",
  "update-bans",
  "revert-bans",
  "grant-create-maps",
  "modify-user-permissions",
]

const notification = useNotification()
const dialog = useDialog()

const playerStore = usePlayerStore()

const loading = ref(false)

const showBudgetModal = ref(false)
const showPermModal = ref(false)

const activeUser = ref<User | null>(null)

const searchQuery = ref("")
const searchValue = ref("")
const queryTimeout = ref()

const columns = ref<DataTableColumn<User>[]>([
  {
    title: "Name",
    key: "name",
    render(rowData) {
      return renderPlayerName(rowData.name, rowData.id)
    },
  },
  {
    title: "Permissions",
    key: "permissions",
    defaultFilterOptionValues: permissions,
    filterOptions: permissions.map((perm) => ({ label: perm, value: perm })),
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
      return h("div", { class: "flex gap-1" }, renderActionButtons(rowData))
    },
  },
])

const data = ref<User[]>([])

const filteredData = computed<User[]>(() => {
  if (searchValue.value) {
    return data.value.filter((v) => v.name.toLowerCase().includes(searchValue.value.toLowerCase()))
  }

  return data.value
})

loadUsersData()

function renderActionButtons(rowData: User) {
  const buttons = []
  if (playerStore.permissions.includes("grant-create-maps")) {
    if (!rowData.permissions.includes("create-maps")) {
      buttons.push(
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to mark this user as a mapper?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.put(`/mappers/${rowData.id}`, null, { withCredentials: true })
                    if (playerStore.steamId === rowData.id) {
                      playerStore.readPlayer()
                    }
                  } catch (error) {
                    notification.error({
                      title: "Operation failed",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Mark As Mapper",
        ),
      )
    } else {
      buttons.push(
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to remove this user as a mapper?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.delete(`/mappers/${rowData.id}`, { withCredentials: true })
                    if (playerStore.steamId === rowData.id) {
                      playerStore.readPlayer()
                    }
                  } catch (error) {
                    notification.error({
                      title: "Operation failed",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Remove As Mapper",
        ),
      )
    }
  }
  if (playerStore.permissions.includes("modify-server-budgets")) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            activeUser.value = rowData
            showBudgetModal.value = true
          },
        },
        () => "Modify Server Budget",
      ),
    )
  }

  if (playerStore.permissions.includes("modify-user-permissions")) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            activeUser.value = rowData
            showPermModal.value = true
          },
        },
        () => "Modify Permissions",
      ),
    )
  }

  return buttons
}

async function loadUsersData() {
  loading.value = true
  try {
    const { data: res } = await axiosClient.get(`/users`)
    // console.log(result.data)

    data.value = res.values || []
  } catch (error) {
    notification.error({
      title: "Failed to fetch users",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function handleUserSearch() {
  if (queryTimeout.value) clearTimeout(queryTimeout.value)
  queryTimeout.value = setTimeout(() => {
    searchValue.value = searchQuery.value
  }, 500)
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
