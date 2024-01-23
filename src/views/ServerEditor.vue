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
          <n-input
            v-model:value="server.ownedBy"
            placeholder="STEAM_1:1:XXXXXXXXXXXX"
          />
        </n-form-item>
      </n-form>

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
  useMessage,
  useDialog,
} from "naive-ui"
import type { FormInst } from "naive-ui"
import { Server } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)

const serverForm = ref<FormInst | null>(null)

const server = reactive({
  name: "",
  ipAddress: "",
  ownedBy: "",
})

const rules = {
  name: {
    required: true,
    message: "Name is required.",
    trigger: ["input", "blur"],
  },
  ipAddress: {
    required: true,
    message: "IP address is required.",
    trigger: ["input", "blur"],
  },
  ownedBy: {
    required: true,
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
      server.ownedBy = data.owned_by.steam_id
    } catch (error) {
      console.log(error)
    }
  }
})

async function saveServer() {
  serverForm.value?.validate((errors) => {
    if (!errors) {
      submitServer()
    } else {
      console.log(errors)
    }
  })
}

async function submitServer() {
  loading.value = true

  try {
    const data = {
      name: server.name,
      ip_address: server.ipAddress,
      owned_by: server.ownedBy,
    }
    // console.log(data)
    
    if (route.params.id) {
      await axiosClient.patch(`/servers/${route.params.id}`, data)
    } else {
      await axiosClient.post("/servers", data)
    }

    message.success("Server created", { duration: 2000 })
    router.push("/home/servers")
  } catch (error) {
    console.log(error)
    message.error("Failed to create server.", { duration: 2000 })
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
