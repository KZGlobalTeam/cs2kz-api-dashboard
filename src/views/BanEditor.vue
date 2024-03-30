<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <n-form ref="banForm" :model="ban" :rules="rules">
        <n-form-item v-if="!route.params.id" label="Steam ID" path="steamId">
          <n-input v-model:value="ban.steamId" placeholder="STEAM_1:1:XXXXXXXXXXX" />
        </n-form-item>

        <n-form-item v-if="!route.params.id" label="Player IP" path="ipAddress">
          <n-input v-model:value="ban.ipAddress" placeholder="127.0.0.1" />
        </n-form-item>

        <n-form-item label="Reason" path="reason">
          <n-select v-model:value="ban.reason" :options="banReasonOptions" />
        </n-form-item>

        <n-form-item v-if="route.params.id" label="Ban Duration" path="banDuration">
          <n-select v-model:value="ban.banDuration" :options="banDurationOptions" />
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
import { ref, reactive, onBeforeMount } from "vue"
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

interface BanExt {
  steamId: string
  ipAddress: string
  reason: string | null
  banDuration: number | null
  created_on: string
  expires_on?: string | null
}

const router = useRouter()
const route = useRoute()
const notification = useNotification()

const loading = ref(false)

const banForm = ref<FormInst | null>(null)

let oldBan: Record<string, string>

const ban = reactive<BanExt>({
  steamId: "",
  ipAddress: "",
  reason: null,
  banDuration: 1,
  created_on: '',
  expires_on: ''
})

const banReasonOptions = [
  { label: 'Auto Bhop', value: 'auto_bhop' },
  { label: 'Auto Strafe', value: 'auto_strafe' },
]

const banDurationOptions = [
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
    key: 'steamid',
    required: route.params.id ? false : true,
    message: "Steam ID is required.",
    trigger: ["input", "blur"],
  },
  ipAddress: {
    key: 'ipaddress',
    required: false,
    message: "Invalid ip address.",
    min: 3
  },
  reason: {
    key: 'reason',
    required: route.params.id ? false : true,
    message: "Ban reason is required.",
    trigger: ["input", "blur"],
  },
}

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
      ban.created_on = data.created_on
      ban.expires_on = data.expires_on || null

      oldBan = JSON.parse(JSON.stringify(ban))
    } catch (error) {
      notification.error({ title: 'Failed to fetch the ban', content: toErrorMsg(error) })
    }
  }
})

async function saveBan() {
  loading.value = true

  let expiresOn
  if (ban.banDuration === null) {
    expiresOn = undefined
  } else if (ban.banDuration === 365 * 100) {
    expiresOn = null
  } else {
    expiresOn = new Date(
      new Date(ban.created_on).getTime() + ban.banDuration * 24 * 60 * 60 * 1000
    ).toISOString()
  }

  try {
    if (route.params.id) {
      if (oldBan.reason === ban.reason && oldBan.expires_on === expiresOn) {
        notification.error({ title: 'No changes made' })
      } else {
        await axiosClient.patch(`/bans/${route.params.id}`, {
          reason: oldBan.reason === ban.reason ? null : ban.reason,
          expires_on: expiresOn
        }, { withCredentials: true })
        notification.success({ title: 'Ban issued', duration: 3000 })
        router.push("/home/bans")
      }
    } else {
      banForm.value?.validate(async (errors) => {
        if (!errors) {
          await axiosClient.post("/bans", {
            player_id: ban.steamId,
            ip_address: ban.ipAddress || null,
            reason: ban.reason,
          }, { withCredentials: true })
          notification.success({ title: 'Ban issued', duration: 3000 })
          router.push("/home/bans")
        } else {
          notification.error({ title: 'Missing Fields' })
        }
      }, (rule) => {
        // if ip field is empty, validate other fields otherwise validate all fields
        return ban.ipAddress ? true : rule?.key !== 'ipaddress'
      })
    }
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
