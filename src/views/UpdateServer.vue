<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <div class="mb-4">
        <p class="mb-2 font-medium">Server Name</p>
        <n-input v-model:value="server.name" placeholder="" />
      </div>

      <div class="mb-4">
        <p class="mb-2 font-medium">Server IP</p>
        <n-input
          v-model:value="server.ip_address"
          placeholder="127.0.0.1:27015"
        />
      </div>

      <div class="mb-4">
        <p class="mb-2 font-medium">Owner</p>
        <n-input
          v-model:value="server.owned_by"
          placeholder="STEAM_1:1:XXXXXXXXXXXX"
        />
      </div>

      <div>
        <n-button
          @click.prevent="updateServer"
          :disabled="loading"
          :loading="loading"
          class="saveButton"
          text-color="#3cc962"
          style="font-size: 16px"
          size="large"
          strong
          bordered
          >Update</n-button
        >
      </div>
    </div>

    <div class="p-4 bg-gray-800 rounded-md">
      <p class="mb-2 font-medium">API Key</p>
      <div class="flex gap-4">
        <n-button
          @click="newKey"
          text-color="#3cc962"
          style="font-size: 16px"
          strong
        >
          New Key
        </n-button>
        <n-button
          @click="revokeKey"
          type="error"
          textColor="#e2e8f0"
          style="font-size: 16px"
          strong
        >
          Revoke Key
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NInput, useNotification, useDialog } from "naive-ui"
import { Server } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { isEqual } from "lodash-es"
import { toErrorMsg, getDiff } from "../utils"

const router = useRouter()
const route = useRoute()
const notification = useNotification()
const dialog = useDialog()

let oldServer: Record<string, string>

const loading = ref(false)

const server = reactive({
  name: "",
  ip_address: "",
  owned_by: "",
})

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/servers/${route.params.id}`,
      )) as AxiosResponse<Server>
      // console.log(data);

      server.name = data.name
      server.ip_address = data.ip_address
      server.owned_by = data.owner.steam_id

      oldServer = JSON.parse(JSON.stringify(server))
    } catch (error) {
      notification.error({
        title: "Failed to fetch the server",
        content: toErrorMsg(error),
      })
    }
  }
})

async function updateServer() {
  if (isEqual(oldServer, toRaw(server))) {
    notification.error({ title: "No changes made" })
  } else {
    loading.value = true
    const update = getDiff(oldServer, toRaw(server))
    try {
      await axiosClient.patch(`/servers/${route.params.id}`, update, {
        withCredentials: true,
      })
      notification.success({ title: "Server updated", duration: 3000 })
      router.push("/home/servers")
    } catch (error) {
      loading.value = false
      notification.error({
        title: "Failed to update server",
        content: toErrorMsg(error),
      })
    }
  }
}

function newKey() {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to generate a new API key for this server?",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: (): Promise<void> => {
      return new Promise((resolve) => {
        const id = route.params.id
        axiosClient
          .put(`/servers/${id}/key`, null, { withCredentials: true })
          .then(() => {
            resolve()
            notification.success({
              title: "New API key generated",
              duration: 3000,
            })
          })
          .catch((error) => {
            resolve()
            notification.error({
              title: "Failed to generate an API key",
              content: toErrorMsg(error),
            })
          })
      })
    },
  })
}

function revokeKey() {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to revoke API key for this server?",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: (): Promise<void> => {
      return new Promise((resolve) => {
        const id = route.params.id
        axiosClient
          .delete(`/servers/${id}/key`, { withCredentials: true })
          .then(() => {
            resolve()
            notification.success({ title: "API key revoked", duration: 3000 })
          })
          .catch((error) => {
            resolve()
            notification.error({
              title: "Failed to revoke API key",
              content: toErrorMsg(error),
            })
          })
      })
    },
  })
}
</script>
