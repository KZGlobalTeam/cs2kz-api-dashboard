<template>
  <div class="mb-4 rounded-md bg-gray-800 p-4">
    <n-form ref="serverForm" :model="server" :rules="rules">
      <n-form-item label="Name" path="name">
        <n-input v-model:value="server.name" placeholder="" />
      </n-form-item>

      <n-form-item label="IP" path="host">
        <n-input v-model:value="server.host" placeholder="127.0.0.1" />
      </n-form-item>

      <n-form-item label="Port" path="port">
        <n-input-number v-model:value="server.port" placeholder="27015" />
      </n-form-item>
    </n-form>

    <div>
      <n-button
        @click.prevent="createServer"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        type="primary"
        strong
        >Create</n-button
      >
    </div>

    <KeyModal :api-key="apiKey" :show-modal="showModal" @close="handleCloseModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRaw } from "vue"
import { NButton, NInput, NInputNumber, NForm, NFormItem, useNotification } from "naive-ui"
import type { FormInst, FormItemRule } from "naive-ui"
import type { AxiosResponse } from "axios"
import axiosClient from "../axios"
import { toErrorMsg, validQuery } from "../utils"
import { useRouter } from "vue-router"
import type { NewServer } from "../types"
import KeyModal from "../components/server/KeyModal.vue"
import { useGameStore } from "../store/game"

const rules = {
  name: {
    required: true,
    message: "Name is required.",
    trigger: ["input", "blur"],
  },
  host: {
    required: true,
    message: "IP is required.",
    trigger: ["input", "blur"],
  },
  port: {
    validator: (_rule: FormItemRule, value: number) => {
      if (value < 1 || value > 65535) {
        return new Error("Port must be between 1 and 65535.")
      }
      return true
    },
    trigger: ["input", "blur"],
  },
}

const router = useRouter()

const notification = useNotification()

const gameStore = useGameStore()

const loading = ref(false)

const serverForm = ref<FormInst | null>(null)

const server = reactive<NewServer>({
  name: "",
  host: "",
  port: 27015,
  game: gameStore.game,
})

const apiKey = ref("")
const showModal = ref(false)

watch(
  () => gameStore.game,
  (g) => {
    server.game = g
  },
)

function handleCloseModal() {
  showModal.value = false
  router.push({ name: "servers" })
}

async function createServer() {
  loading.value = true

  serverForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        const { data } = (await axiosClient.post("/servers", validQuery(toRaw(server)), {
          withCredentials: true,
        })) as AxiosResponse<{ server_id: number; access_key: string }>

        apiKey.value = data.access_key

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
