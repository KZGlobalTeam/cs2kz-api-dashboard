<template>
  <div class="rounded-md bg-gray-800 p-4">
    <div class="mb-4 flex justify-between gap-4">
      <!-- filters -->
      <n-space align="center">
        <n-input @keyup.enter="loadMapsData" type="text" v-model:value="mapQuery.name" placeholder="Name" />

        <n-input
          v-if="!showMyMaps"
          @keyup.enter="loadMapsData"
          type="text"
          v-model:value="mapQuery.created_by"
          placeholder="Creator"
        />

        <n-select
          style="width: 8rem"
          @update-value="handleStatusChange"
          v-model:value="mapQuery.state"
          :options="options"
          placeholder="State"
        />
      </n-space>

      <div v-if="playerStore.steamId" class="flex gap-4">
        <n-button type="info" :secondary="showMyMaps ? false : true" @click="showMyMaps = !showMyMaps">
          My Maps
        </n-button>
      </div>
    </div>

    <!-- maps table -->
    <div class="mb-4">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: Map) => row.id"
        size="small"
        @update:sorter="handleSorterChange"
      />
    </div>

    <div class="flex justify-end gap-4">
      <n-button @click="loadMapsData">Refresh</n-button>
      <n-button v-if="canCreateMaps" secondary type="primary" @click="router.push({ name: 'createmaps' })"
        >Create Map</n-button
      >
    </div>

    <state-modal v-model:show="showStateModal" :map="activeMap" @update:success="loadMapsData()" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, h, toRaw } from "vue"
import { NInput, NDataTable, NButton, NTag, NSpace, NSelect, useNotification, useDialog } from "naive-ui"
import type { DataTableSortState, DataTableColumn } from "naive-ui"
import type { Game, Map, MapState } from "../types"
import { useRouter } from "vue-router"
import axiosClient from "../axios"
import { toLocal, renderWorkshopId, toErrorMsg, validQuery, renderPlayerName } from "../utils"
import { usePlayerStore } from "../store/player"
import { useGameStore } from "../store/game"
import StateModal from "../components/map/StateModal.vue"
import { debounce } from "lodash-es"

type MapQuery = {
  game: Game
  name: string
  created_by: string
  state: MapState | null
}

type Tag = "default" | "success" | "error" | "warning" | "info"

const options = [
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "WIP",
    value: "wip",
  },
  {
    label: "Graveyard",
    value: "graveyard",
  },
]

const tagTypeMap: Record<MapState, Tag> = {
  approved: "success",
  completed: "info",
  pending: "warning",
  wip: "default",
  graveyard: "error",
}

const router = useRouter()

const notification = useNotification()
const dialog = useDialog()

const playerStore = usePlayerStore()
const gameStore = useGameStore()

const showMyMaps = ref(false)

const showStateModal = ref(false)

const activeMap = ref<Map | null>(null)

const loading = ref(true)
const data = ref<Map[]>([])

const mapQuery = reactive<MapQuery>({
  game: gameStore.game,
  name: "",
  created_by: "",
  state: null,
})

const columns = ref<DataTableColumn<Map>[]>([
  {
    title: "ID",
    key: "id",
    // if its sorted initially
    // 'descend' | 'ascend' | false
    sortOrder: false,
    sorter(rowA, rowB) {
      return rowA.id - rowB.id
    },
  },
  {
    title: "Map",
    key: "name",
    sortOrder: false,
    // use Array.sort
    sorter: "default",
  },
  {
    title: "Workshop",
    key: "workshop_id",
    render(rowData) {
      return renderWorkshopId(rowData.workshop_id)
    },
  },
  {
    title: "Creator",
    key: "created_by",
    render(rowData) {
      return renderPlayerName(rowData.created_by.name, rowData.created_by.id)
    },
  },
  {
    title: "Status",
    key: "status",
    render(rowData) {
      return h(
        NTag,
        {
          type: tagTypeMap[rowData.state],
        },
        {
          default: () => options.find((option) => option.value === rowData.state)!.label,
        },
      )
    },
  },
  {
    title: "Courses",
    key: "courseCount",
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

const canCreateMaps = computed(() => {
  return playerStore.permissions.includes("create-maps")
})

const debouncedLoadMapsData = debounce(loadMapsData, 500)

watch(
  () => gameStore.game,
  (g) => {
    mapQuery.game = g
  },
)

watch(showMyMaps, (val) => {
  mapQuery.created_by = val ? playerStore.steamId : ""
})

watch(mapQuery, () => {
  debouncedLoadMapsData()
})

loadMapsData()

function renderActionButtons(rowData: Map) {
  if (playerStore.permissions.includes("create-maps")) {
    if (rowData.state === "wip") {
      return [
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to submit this map for approval?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.put(`/maps/${rowData.id}/state`, { state: "pending" }, { withCredentials: true })
                    await loadMapsData()
                  } catch (error) {
                    notification.error({
                      title: "Failed to submit map",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Submit",
        ),

        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              router.push({ name: "updatemap", params: { id: rowData.id } })
            },
          },
          () => "Update",
        ),
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to sync to the workshop map?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.patch(
                      `/maps/${rowData.id}`,
                      { workshop_id: rowData.workshop_id },
                      { withCredentials: true },
                    )
                    await loadMapsData()
                  } catch (error) {
                    notification.error({
                      title: "Failed to sync to workshop",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Sync",
        ),
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to mark this map as completed?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.put(
                      `/maps/${rowData.id}/state`,
                      { state: "completed" },
                      { withCredentials: true },
                    )
                    await loadMapsData()
                  } catch (error) {
                    notification.error({
                      title: "Failed to submit map",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Complete",
        ),
      ]
    } else if (rowData.state === "graveyard") {
      return [
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to submit this map for approval?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.put(`/maps/${rowData.id}/state`, { state: "pending" }, { withCredentials: true })
                    await loadMapsData()
                  } catch (error) {
                    notification.error({
                      title: "Failed to submit map",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Submit",
        ),
        h(
          NButton,
          {
            size: "tiny",
            onClick: () => {
              dialog.warning({
                title: "Warning",
                content: "Are you sure you want to mark this map as completed?",
                class: "font-poppings",
                positiveText: "Yes",
                negativeText: "Cancel",
                onPositiveClick: async () => {
                  try {
                    await axiosClient.put(
                      `/maps/${rowData.id}/state`,
                      { state: "completed" },
                      { withCredentials: true },
                    )
                    await loadMapsData()
                  } catch (error) {
                    notification.error({
                      title: "Failed to submit map",
                      content: toErrorMsg(error),
                    })
                  } finally {
                    loading.value = false
                  }
                },
              })
            },
          },
          () => "Complete",
        ),
      ]
    }
  } else if (playerStore.permissions.includes("update-maps")) {
    return [
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            activeMap.value = rowData
            showStateModal.value = true
          },
        },
        () => "Modify State",
      ),
      h(
        NButton,
        {
          size: "tiny",
          onClick: () => {
            router.push({ name: "updatemap", params: { id: rowData.id } })
          },
        },
        () => "Update",
      ),
    ]
  } else {
    return []
  }
}

async function loadMapsData() {
  loading.value = true
  try {
    const { data: res } = await axiosClient.get("/maps", { params: validQuery(toRaw(mapQuery)) })

    data.value = res?.values
      ? res.values.map((v: Map) => ({
          id: v.id,
          name: v.name,
          state: v.state,
          created_at: v.created_at,
          created_by: v.created_by,
          workshop_id: v.workshop_id,
          courseCount: v.courses.length,
        }))
      : []
  } catch (error) {
    notification.error({
      title: "Failed to fetch maps",
      content: toErrorMsg(error),
    })
  } finally {
    loading.value = false
  }
}

function handleStatusChange() {
  nextTick(() => {
    loadMapsData()
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
