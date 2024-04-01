<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <n-form ref="serverForm" :model="server" :rules="rules">
      <n-form-item label="Server Name" path="name">
        <n-input v-model:value="server.name" placeholder="" />
      </n-form-item>

      <n-form-item label="Server IP" path="ip_address">
        <n-input
          v-model:value="server.ip_address"
          placeholder="127.0.0.1:27015"
        />
      </n-form-item>

      <n-form-item label="Owner" path="owned_by">
        <n-input
          v-model:value="server.owned_by"
          placeholder="STEAM_1:1:XXXXXXXXXXXX"
        />
      </n-form-item>
    </n-form>

    <div>
      <n-button
        @click.prevent="createServer"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        text-color="#3cc962"
        size="large"
        strong
        bordered
        >Create</n-button
      >
    </div>

    <KeyModal :api-key="apiKey" redirect-to="servers" :show-modal="showModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { NButton, NInput, NForm, NFormItem, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import type { AxiosResponse } from "axios"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"
import KeyModal from "../components/server/KeyModal.vue"

const notification = useNotification()

const loading = ref(false)

const serverForm = ref<FormInst | null>(null)

const server = reactive({
  name: "",
  ip_address: "",
  owned_by: "",
})

const apiKey = ref("")
const showModal = ref(false)

const rules = {
  name: {
    required: true,
    message: "Name is required.",
    trigger: ["input", "blur"],
  },
  ip_address: {
    required: true,
    message: "IP address is required.",
    trigger: ["input", "blur"],
  },
  owned_by: {
    required: true,
    message: "Owner's steam ID is required.",
    trigger: ["input", "blur"],
  },
}

async function createServer() {
  loading.value = true

  serverForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        const { data } = (await axiosClient.post("/servers", server, {
          withCredentials: true,
        })) as AxiosResponse<{ server_id: number; refresh_key: string }>
        apiKey.value = data.refresh_key

        showModal.value = true
        notification.success({ title: "Server created", duration: 3000 })
      } catch (error) {
        notification.error({
          title: "Failed to create server",
          content: toErrorMsg(error),
        })
        loading.value = false
      }
    } else {
      loading.value = false
      notification.error({ title: "Missing Fields" })
    }
  })
}
</script>
