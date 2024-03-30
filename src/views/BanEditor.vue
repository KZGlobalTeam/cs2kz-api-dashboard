<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <n-form ref="banForm" :model="ban" :rules="rules">
        <n-form-item label="Steam ID" path="steamId">
          <n-input v-model:value="ban.steamId" placeholder="STEAM_1:1:XXXXXXXXXXX" />
        </n-form-item>

        <n-form-item label="Player IP" path="ipAddress">
          <n-input v-model:value="ban.ipAddress" placeholder="127.0.0.1" />
        </n-form-item>

        <n-form-item label="Reason" path="reason">
          <n-select v-model:value="ban.reason" :options="banReasonOptions" />
        </n-form-item>

        <n-form-item v-if="editing" label="Ban Period" path="banPeriod">
          <n-select v-model:value="ban.banPeriod" :options="banPeriodOptions" />
        </n-form-item>
      </n-form>

      <div>
        <n-button @click.prevent="saveBan" :disabled="loading" :loading="loading" class="saveButton"
          text-color="#3cc962" size="large" strong bordered>Ban</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NButton,
  NInput,
  NSelect,
  NForm,
  NFormItem,
  useNotification,
} from "naive-ui"
import type { FormInst } from "naive-ui"
import type { Ban } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { toErrorMsg } from "../utils"

const router = useRouter()
const route = useRoute()
const notification = useNotification()

const loading = ref(false)

const created_on = ref("")

const banForm = ref<FormInst | null>(null)

const ban = reactive({
  steamId: "",
  ipAddress: "",
  reason: "",
  banPeriod: null,
})

const banReasonOptions = [
  { label: 'Auto Bhop', value: 'auto_bhop' },
  { label: 'Auto Strafe', value: 'auto_strafe' },
]

const banPeriodOptions = [
  { label: "1 Day", value: 1 },
  { label: "1 Week", value: 7 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
  { label: "Permanent", value: 365 * 100 },
]

const rules = {
  steamId: {
    required: true,
    message: "Steam ID is required.",
    trigger: ["input", "blur"],
  },
  reason: {
    required: true,
    message: "Ban reason is required.",
    trigger: ["input", "blur"],
  },
}

const editing = computed(() => {
  return route.params.id ? true : false
})

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/bans/${route.params.id}`
      )) as AxiosResponse<Ban>
      // console.log(data);

      ban.steamId = data.player.steam_id
      ban.ipAddress = data.player?.ip_address || ''
      ban.reason = data.reason

      created_on.value = data.created_on
    } catch (error) {
      notification.error({ title: 'Failed to fetch the ban', content: toErrorMsg(error) })
    }
  }
})

async function saveBan() {
  banForm.value?.validate((errors) => {
    if (!errors) {
      submitBan()
    } else {
      notification.error({ title: 'Validation Failed' })
    }
  })
}

async function submitBan() {
  loading.value = true

  try {
    let expiresOn
    if (ban.banPeriod === null) {
      expiresOn = undefined
    } else if (ban.banPeriod === 365 * 100) {
      expiresOn = null
    } else {
      expiresOn = new Date(
        new Date(created_on.value).getTime() +
        ban.banPeriod * 24 * 60 * 60 * 1000
      ).toISOString()
    }

    console.log(expiresOn)

    if (route.params.id) {
      await axiosClient.patch(`/bans/${route.params.id}`, {
        reason: ban.reason,
        expires_on: expiresOn
      }, { withCredentials: true })
    } else {
      await axiosClient.post("/bans", {
        player_id: ban.steamId,
        ip_address: ban.ipAddress || null,
        reason: ban.reason,
      }, { withCredentials: true })
    }

    notification.success({ title: 'Ban issued', duration: 3000 })
    router.push("/home/bans")
  } catch (error) {
    notification.error({ title: 'Failed to issue the ban', content: toErrorMsg(error) })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.saveButton {
  font-size: 16px;
}
</style>
