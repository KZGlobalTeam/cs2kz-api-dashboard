<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <n-form ref="serverForm" :model="server" :rules="rules">
        <n-form-item label="Server Name" path="name">
          <n-input v-model:value="server.name" placeholder="" />
        </n-form-item>

        <n-form-item label="Server IP" path="ipAddress">
          <n-input v-model:value="server.ipAddress" placeholder="127.0.0.1:27015" />
        </n-form-item>

        <n-form-item label="Owner" path="ownedBy">
          <n-input v-model:value="server.ownedBy" placeholder="STEAM_1:1:XXXXXXXXXXXX" />
        </n-form-item>
      </n-form>

      <div>
        <n-button @click.prevent="saveServer" :disabled="loading" :loading="loading" class="saveButton"
          text-color="#3cc962" size="large" strong bordered>Save</n-button>
      </div>
    </div>

    <div v-if="route.params.id" class="p-4 bg-gray-800 rounded-md">
      <!-- api key -->
      <p class="mb-2 font-medium">API Key</p>
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
import { ref, reactive, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NButton,
  NInput,
  NForm,
  NFormItem,
  useNotification,
  useDialog,
} from "naive-ui"
import type { FormInst } from "naive-ui"
import { Server } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { toErrorMsg } from "../utils"

const router = useRouter()
const route = useRoute()
const notification = useNotification()
const dialog = useDialog()

let oldServer: Record<string, string>

const loading = ref(false)

const serverForm = ref<FormInst | null>(null)

const server = reactive({
  name: "",
  ipAddress: "",
  ownedBy: "",
})

const rules = {
  name: {
    required: route.params.id ? false : true,
    message: "Name is required.",
    trigger: ["input", "blur"],
  },
  ipAddress: {
    required: route.params.id ? false : true,
    message: "IP address is required.",
    trigger: ["input", "blur"],
  },
  ownedBy: {
    required: route.params.id ? false : true,
    message: "Owner's steam ID is required.",
    trigger: ["input", "blur"],
  },
}

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/servers/${route.params.id}`
      )) as AxiosResponse<Server>
      // console.log(data);
      
      server.name = data.name
      server.ipAddress = data.ip_address
      server.ownedBy = data.owner.steam_id

      oldServer = JSON.parse(JSON.stringify(server))
    } catch (error) {
      notification.error({ title: 'Failed to fetch servers', content: toErrorMsg(error) })
    }
  }
})

async function saveServer() {
  loading.value = true

  try {
    if (route.params.id) {
      if (oldServer.name === server.name && oldServer.ipAddress === server.ipAddress && oldServer.ownedBy === server.ownedBy) {
        notification.error({ title: 'No changes made' })
      } else {
        const data = {
          name: oldServer.name === server.name ? null : server.name,
          ip_address: oldServer.ipAddress === server.ipAddress ? null : server.ipAddress,
          owned_by: oldServer.ownedBy === server.ownedBy ? null : server.ownedBy,
        }
        await axiosClient.patch(`/servers/${route.params.id}`, data, { withCredentials: true })
        notification.success({ title: 'Server updated', duration: 3000 })
        router.push("/home/servers")
      }
    } else {
      serverForm.value?.validate(async (errors) => {
        if (!errors) {
          const data = {
            name: server.name,
            ip_address: server.ipAddress,
            owned_by: server.ownedBy,
          }
          await axiosClient.post("/servers", data, { withCredentials: true })
          notification.success({ title: 'Server created', duration: 3000 })
          router.push("/home/servers")
        } else {
          notification.error({ title: 'Missing Fields' })
        }
      })
    }
  } catch (error) {
    notification.error({ title: 'Failed to create server', content: toErrorMsg(error) })
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
          .put(`/servers/${id}/key`, null, { withCredentials: true })
          .then(() => {
            resolve()
            notification.success({ title: 'New API key generated', duration: 3000 })
          })
          .catch((error) => {
            resolve()
            notification.error({ title: 'Failed to generate an API key', content: toErrorMsg(error) })
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
            notification.success({ title: 'API key revoked', duration: 3000 })
          })
          .catch((error) => {
            resolve()
            notification.error({ title: 'Failed to revoke API key', content: toErrorMsg(error) })
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
