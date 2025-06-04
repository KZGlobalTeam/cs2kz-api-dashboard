<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-start gap-4">
      <!-- filters -->
      <n-input
        @keyup.enter="loadBansData"
        type="text"
        v-model:value="banQuery.player_id"
        placeholder="Player"
        style="width: 200px"
      />

      <n-input
        @keyup.enter="loadBansData"
        type="text"
        v-model:value="banQuery.banned_by"
        placeholder="Banned By"
        style="width: 200px"
      />

      <n-select
        style="width: 8rem"
        @update-value="nextTick(loadBansData)"
        v-model:value="banQuery.reason"
        :options="banReasonOptions"
        placeholder="Ban Reason"
      />
    </div>

    <!-- servers table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :row-key="(rowData: Ban) => rowData.id"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button @click="loadBansData">Refresh</n-button>
      <n-button v-if="canCreateBans" type="error" secondary @click="router.push({ name: 'createban' })"
        >Create Ban</n-button
      >
    </div>
    <ban-reason-modal v-model:show="showBanReasonModal" :ban="activeBan" @revert:success="loadBansData()" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, nextTick, toRaw, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { NInput, NDataTable, NButton, NSelect, useNotification } from "naive-ui"
import type { DataTableSortState, DataTableColumn } from "naive-ui"
import axiosClient from "../axios"
import type { Ban } from "../types"
import { toLocal, renderBannedPlayerName, renderPlayerName, toErrorMsg, validQuery } from "../utils"
import { usePlayerStore } from "../store/player"
import { debounce } from "lodash-es"
import BanReasonModal from "../components/ban/BanReasonModal.vue"

interface BanQuery {
  player_id: string
  banned_by: string
  reason: string | null
}

const router = useRouter()

const notification = useNotification()

const playerStore = usePlayerStore()

const banReasonOptions = [
  { label: "Macro", value: "macro" },
  { label: "Auto Bhop", value: "autobhop" },
  { label: "Auto Strafe", value: "autostrafe" },
]

const loading = ref(false)

const activeBan = ref<Ban | null>(null)

const showBanReasonModal = ref(false)

const banQuery = reactive<BanQuery>({
  player_id: "",
  banned_by: "",
  reason: null,
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
      return renderBannedPlayerName(
        rowData.player.name,
        rowData.player.id,
        rowData.unban === null || rowData.unban === undefined,
      )
    },
  },
  {
    title: "Reason",
    key: "reason",
    render(rowData) {
      return banReasonOptions.find((option) => option.value === rowData.reason)!.label
    },
  },
  {
    title: "Banned By",
    key: "banned_by",
    render(rowData) {
      return rowData.banned_by.type === "server"
        ? "Anticheat"
        : renderPlayerName(rowData.banned_by.user_id, rowData.banned_by.user_id)
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
    title: "Expires On",
    key: "expires_on",
    sortOrder: false,
    render(rowData) {
      return toLocal(rowData.expires_at)
    },
    sorter(rowA, rowB) {
      return new Date(rowA.expires_at).getTime() - new Date(rowB.expires_at).getTime()
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

const data = ref<Ban[]>([])

const canCreateBans = computed(() => {
  return playerStore.permissions.includes("create-bans")
})

const debouncedLoadBansData = debounce(loadBansData, 300)

watch(banQuery, () => {
  debouncedLoadBansData()
})

loadBansData()

function renderActionButtons(rowData: Ban) {
  const buttons = []

  if (playerStore.permissions.includes("update-bans")) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            router.push({ name: "updateban", params: { id: rowData.id } })
          },
        },
        () => "Update",
      ),
    )
  }

  if (playerStore.permissions.includes("revert-bans") && !rowData.unban) {
    buttons.push(
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            activeBan.value = rowData
            showBanReasonModal.value = true
          },
        },
        () => "Revert",
      ),
    )
  }

  return buttons
}

async function loadBansData() {
  loading.value = true
  try {
    const { data: res } = await axiosClient.get("/bans", { params: validQuery(toRaw(banQuery)) })

    data.value = res?.values || []
  } catch (error) {
    console.error(error)

    notification.error({
      title: "Failed to fetch bans",
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
