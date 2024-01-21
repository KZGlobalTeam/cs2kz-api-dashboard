<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <div class="mb-4">
        <p class="mb-2">Name</p>
        <n-input v-model:value="name" placeholder="" />
      </div>

      <div class="mb-4">
        <p class="mb-2">IP Address</p>
        <n-input v-model:value="ipAddress" placeholder="0.0.0.0:27015" />
      </div>

      <div class="mb-4">
        <p class="mb-2 font-medium">Owner</p>
        <n-input v-model:value="ownedBy" placeholder="STEAM_1:1:XXXXXXXXXXX" />
      </div>

      <div>
        <n-button
          @click.prevent="saveServer"
          :disabled="loading"
          :loading="loading"
          class="saveButton"
          text-color="#3cc962"
          size="large"
          strong
          bordered
          >Save</n-button
        >
      </div>
    </div>

    <div class="p-4 bg-gray-800 rounded-md">
      <!-- api key -->
      <p class="mb-2 font-medium">API Key</p>
      <!-- two buttons for new key and revoke the current key -->
      <div class="flex gap-4">
        <n-button @click="newKey" text-color="#3cc962" strong>
          New Key
        </n-button>
        <n-button @click="revokeKey" type="error" textColor="#e2e8f0" strong>
          Revoke Key
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NInput, useMessage, useDialog } from "naive-ui"
import { Server } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)

const name = ref("")
const ipAddress = ref("")
const ownedBy = ref("")

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/servers/${route.params.id}`
      )) as AxiosResponse<Server>
      // console.log(data);

      name.value = data.name
      ipAddress.value = data.ip_address
      ownedBy.value = data.owned_by.steam_id
    } catch (error) {
      console.log(error)
    }
  }
})

async function saveServer() {
  loading.value = true

  try {
    const data = {
      name: name.value,
      ip_address: ipAddress.value,
      owned_by: ownedBy.value,
    }
    console.log(data)

    if (route.params.id) {
      await axiosClient.patch(`/servers/${route.params.id}`, data)
    } else {
      await axiosClient.post("/servers", data)
    }

    message.success("Server saved", { duration: 2000 })
    router.push("/home/servers")
  } catch (error) {
    console.log(error)
    message.error("Failed to save server", { duration: 2000 })
  } finally {
    loading.value = false
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
          .put(`/servers/${id}/key`)
          .then(() => {
            resolve()
            message.success("new API key generated", { duration: 2000 })
          })
          .catch((error) => {
            resolve()
            message.error("Failed to generate new API key", { duration: 2000 })
            console.log(error)
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
          .delete(`/servers/${id}/key`)
          .then(() => {
            resolve()
            message.success("API key revoked", { duration: 2000 })
          })
          .catch((error) => {
            resolve()
            message.error("Failed to revoke API key", { duration: 2000 })
            console.log(error)
          })
      })
    },
  })
}
</script>

<style scoped>
.saveButton {
  font-size: 16px;
}
</style>
