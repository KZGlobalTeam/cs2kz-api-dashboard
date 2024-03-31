<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <n-form ref="banForm" :model="ban" :rules="rules">
        <n-form-item label="Steam ID" path="player_id">
          <n-input v-model:value="ban.player_id" placeholder="STEAM_1:1:XXXXXXXXXXX" />
        </n-form-item>

        <n-form-item label="Player IP" path="player_ip">
          <n-input v-model:value="ban.player_ip" placeholder="127.0.0.1" />
        </n-form-item>

        <n-form-item label="Reason" path="reason">
          <n-select v-model:value="ban.reason" :options="banReasonOptions" />
        </n-form-item>
      </n-form>

      <div>
        <n-button @click.prevent="createBan" :disabled="loading" :loading="loading" class="saveButton"
          text-color="#3cc962" style="font-size: 16px;" size="large" strong bordered>Ban</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import {
  NButton,
  NInput,
  NSelect,
  NForm,
  NFormItem,
  useNotification,
} from "naive-ui"
import type { FormInst } from "naive-ui"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"

const router = useRouter()
const notification = useNotification()

const loading = ref(false)

const banForm = ref<FormInst | null>(null)

const ban = reactive({
  player_id: "",
  player_ip: "",
  reason: null,
})

const banReasonOptions = [
  { label: 'Auto Bhop', value: 'auto_bhop' },
  { label: 'Auto Strafe', value: 'auto_strafe' },
]

const rules = {
  player_id: {
    key: 'steamid',
    required: true,
    message: "Steam ID is required.",
    trigger: ["input", "blur"],
  },
  reason: {
    key: 'reason',
    required: true,
    message: "Ban reason is required.",
    trigger: ["input", "blur"],
  },
}


async function createBan() {
  loading.value = true

  banForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.post("/bans", {
          player_id: ban.player_id,
          ip_address: ban.player_ip || null,
          reason: ban.reason,
        }, { withCredentials: true })
        notification.success({ title: 'Ban issued', duration: 3000 })
        router.push("/home/bans")
      } catch (error) {
        loading.value = false
        notification.error({ title: 'Failed to issue the ban', content: toErrorMsg(error) })
      }
    } else {
      loading.value = false
      notification.error({ title: 'Missing Fields' })
    }
  })
}
</script>