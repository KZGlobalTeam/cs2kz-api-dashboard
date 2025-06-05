<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-between gap-4">
      <!-- filters -->
      <n-space align="center">
        <n-input @keyup.enter="loadServersData" type="text" v-model:value="serverQuery.name" placeholder="Name" />

        <n-input
          v-if="!showMyServers"
          @keyup.enter="loadServersData"
          type="text"
          v-model:value="serverQuery.owned_by"
          placeholder="Owner"
        />
      </n-space>

      <div v-if="playerStore.steamId" class="flex gap-4">
        <n-button type="info" :secondary="showMyServers ? false : true" @click="showMyServers = !showMyServers">
          My Servers
        </n-button>
      </div>
    </div>

    <!-- servers table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :row-key="(rowData: Server) => rowData.id"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button @click="loadServersData">Refresh</n-button>
      <n-tooltip v-if="canCreateServers" trigger="hover">
        <template #trigger>
          <n-button
            :disabled="playerStore.serverBudget <= 0"
            secondary
            type="primary"
            @click="router.push({ name: 'createserver' })"
            >Register Server</n-button
          >
        </template>
        <span>Your current server budgets is {{ playerStore.serverBudget }}.</span>
      </n-tooltip>
    </div>

    <key-modal :api-key="apiKey" :show-modal="showModal" @close="handleCloseModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, watch, toRaw, computed } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, NSpace, NTag, NTooltip, useNotification, useDialog } from "naive-ui"
import type { DataTableSortState, DataTableColumn } from "naive-ui"
import axiosClient from "../axios"
import type { Game, Server } from "../types"
import { toLocal, renderPlayerName, toErrorMsg, validQuery } from "../utils"
import { useGameStore } from "../store/game"
import { usePlayerStore } from "../store/player"
import KeyModal from "../components/server/KeyModal.vue"
import { debounce } from "lodash-es"

type ServerQuery = {
  game: Game
  name: string
  owned_by: string
  include_degloballed: boolean
}

const router = useRouter()

const notification = useNotification()
const dialog = useDialog()

const gameStore = useGameStore()
const playerStore = usePlayerStore()

const loading = ref(false)

const showMyServers = ref(false)

const apiKey = ref("")
const showModal = ref(false)

const serverQuery = reactive<ServerQuery>({
  game: gameStore.game,
  name: "",
  owned_by: "",
  include_degloballed: true,
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
    key: "owner_id",
    render(rowData) {
      return renderPlayerName(rowData.owner.name, rowData.owner.id)
    },
  },
  {
    title: "Status",
    key: "is_global",
    render(rowData) {
      return h(
        NTag,
        {
          type: rowData.is_global ? "success" : "warning",
        },
        {
          default: () => (rowData.is_global ? "Global" : "Degloballed"),
        },
      )
    },
  },
  {
    title: "Created On",
    key: "created_on",
    sortOrder: false,
    render(rowData) {
      return toLocal(rowData.created_at)
    },
    sorter(rowA, rowB) {
      return new Date(rowA.created_at).getTime() - new Date(rowB.created_at).getTime()
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

const data = ref<Server[]>([])

const canCreateServers = computed(() => {
  return playerStore.steamId !== ""
})

const debouncedLoadServersData = debounce(loadServersData, 500)

watch(
  () => gameStore.game,
  (g) => {
    serverQuery.game = g
  },
  { immediate: true },
)

watch(showMyServers, (val) => {
  serverQuery.owned_by = val ? playerStore.steamId : ""
})

watch(serverQuery, () => {
  debouncedLoadServersData()
})

loadServersData()

function renderActionButtons(rowData: Server) {
  const buttons = []
  if (playerStore.permissions.includes("modify-server-metadata") || playerStore.steamId === rowData.owner.id) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            router.push({ name: "updateserver", params: { id: rowData.id } })
          },
        },
        () => "Update",
      ),
    )
  }
  if (playerStore.permissions.includes("reset-server-access-keys")) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            dialog.warning({
              title: "Warning",
              content: "Are you sure you want to reset server access key?",
              class: "font-poppings",
              positiveText: "Yes",
              negativeText: "Cancel",
              onPositiveClick: async () => {
                try {
                  const { data } = await axiosClient.put(`/servers/${rowData.id}/access-key`, null, {
                    withCredentials: true,
                  })

                  apiKey.value = data.access_key
                  showModal.value = true
                } catch (error) {
                  notification.error({
                    title: "Failed to reset access key",
                    content: toErrorMsg(error),
                  })
                } finally {
                  loading.value = false
                }
              },
            })
          },
        },
        () => "Reset Key",
      ),
    )
  }

  if (playerStore.permissions.includes("delete-server-access-keys") && rowData.is_global) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            dialog.warning({
              title: "Warning",
              content: "Are you sure you want to delete server access key?",
              class: "font-poppings",
              positiveText: "Yes",
              negativeText: "Cancel",
              onPositiveClick: async () => {
                try {
                  await axiosClient.delete(`/servers/${rowData.id}/access-key`, { withCredentials: true })
                  await loadServersData()
                  notification.success({
                    title: "Access key deleted",
                  })
                } catch (error) {
                  notification.error({
                    title: "Failed to delete access key",
                    content: toErrorMsg(error),
                  })
                } finally {
                  loading.value = false
                }
              },
            })
          },
        },
        () => "Delete Key",
      ),
    )
  }

  return buttons
}

function handleCloseModal() {
  showModal.value = false
}

async function loadServersData() {
  loading.value = true
  try {
    const { data: res } = await axiosClient.get("/servers", { params: validQuery(toRaw(serverQuery)) })

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
