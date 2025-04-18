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
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRaw } from "vue"
import { NButton, NInput, NInputNumber, NForm, NFormItem, useNotification } from "naive-ui"
import type { FormInst, FormItemRule } from "naive-ui"
import { useRoute, useRouter } from "vue-router"
import axiosClient from "../axios"
import { toErrorMsg, validQuery } from "../utils"
import type { NewServer } from "../types"
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

const notification = useNotification()

const gameStore = useGameStore()

const route = useRoute()
const router = useRouter()

const loading = ref(false)

const serverForm = ref<FormInst | null>(null)

const server = reactive<NewServer>({
  name: "",
  host: "",
  port: 27015,
  game: gameStore.game,
})

watch(
  () => gameStore.game,
  (g) => {
    server.game = g
  },
)

loadServerData()

async function loadServerData() {
  try {
    const { data } = await axiosClient.get(`/servers/${route.params.id}`)
    server.name = data.name
    server.host = data.host
    server.port = data.port
  } catch (error) {
    notification.error({
      title: "Failed to load server data",
      content: toErrorMsg(error),
    })
  }
}

async function updateServer() {
  loading.value = true

  serverForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.patch(`/servers/${route.params.id}`, validQuery(toRaw(server)), {
          withCredentials: true,
        })

        notification.success({ title: "Server updated", duration: 3000 })

        router.push({ name: "servers" })
      } catch (error) {
        notification.error({
          title: "Failed to update server",
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
