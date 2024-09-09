<template>
  <div>
    <div class="mb-4 rounded-md bg-gray-800 p-4">
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
          v-model:value="server.owner"
          placeholder="STEAM_1:1:XXXXXXXXXXXX"
        />
      </div>

      <div>
        <n-button
          @click.prevent="updateServer"
          :disabled="loading"
          :loading="loading"
          class="saveButton"
          type="primary"
          strong
          >Update</n-button
        >
      </div>
    </div>

    <div class="rounded-md bg-gray-800 p-4">
      <p class="mb-2 font-medium">API Key</p>
      <div class="flex gap-4">
        <n-button @click="newKey" type="primary" secondary strong>
          New Key
        </n-button>
        <n-button @click="revokeKey" type="error" secondary strong>
          Revoke Key
        </n-button>
      </div>
    </div>

    <KeyModal
      :api-key="apiKey"
      :redirect-to="isAdmin ? 'servers' : 'myservers'"
      :show-modal="showModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NInput, useNotification, useDialog } from "naive-ui"
import { Server } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { isEqual } from "lodash-es"
import { toErrorMsg, transformSrv } from "../utils"
import KeyModal from "../components/server/KeyModal.vue"

const router = useRouter()
const route = useRoute()
const notification = useNotification()
const dialog = useDialog()

let oldServer: Record<string, string>

const loading = ref(false)

const apiKey = ref("")
const showModal = ref(false)

const isAdmin = computed(() => route.name === "createserver")

const server = reactive({
  name: "",
  ip_address: "",
  owner: "",
})

onBeforeMount(async () => {
  try {
    const { data } = (await axiosClient.get(
      `/servers/${route.params.id}`,
    )) as AxiosResponse<Server>
    // console.log(data);

    server.name = data.name
    server.ip_address = `${data.host}:${data.port}`
    server.owner = data.owner.steam_id

    oldServer = JSON.parse(JSON.stringify(server))
  } catch (error) {
    notification.error({
      title: "Failed to fetch the server",
      content: toErrorMsg(error),
    })
  }
})

async function updateServer() {
  if (isEqual(oldServer, toRaw(server))) {
    notification.error({ title: "No changes made" })
  } else {
    loading.value = true
    try {
      await axiosClient.patch(
        `/servers/${route.params.id}`,
        transformSrv(server, false),
        {
          withCredentials: true,
        },
      )
      notification.success({ title: "Server updated", duration: 3000 })
      console.log(route)

      router.go(-1)
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
          .then(({ data }: AxiosResponse<{ key: string }>) => {
            resolve()
            apiKey.value = data.key
            showModal.value = true
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
            router.push({ name: isAdmin.value ? "servers" : "myservers" })
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
