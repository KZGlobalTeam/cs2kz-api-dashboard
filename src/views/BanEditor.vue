<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <div class="mb-4">
      <p class="mb-2">Steam ID</p>
      <n-input v-model:value="steamId" placeholder="STEAM_1:1:XXXXXXXXXXX" />
    </div>

    <div class="mb-4">
      <p class="mb-2">Player IP</p>
      <n-input v-model:value="ipAddress" placeholder="127.0.0.1" />
    </div>

    <div class="mb-4">
      <p class="mb-2 font-medium">Reason</p>
      <n-input v-model:value="reason" placeholder="Bhop Hack" />
    </div>

    <div v-if="editing" class="mb-4">
      <p class="mb-2 font-medium">Ban Period</p>
      <n-select v-model:value="banPeriod" :options="banPeriodOptions" />
    </div>

    <div>
      <n-button
        @click.prevent="saveBan"
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
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NInput, NSelect, useMessage } from "naive-ui"
import { Ban } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"

const router = useRouter()
const route = useRoute()
const message = useMessage()

const loading = ref(false)

const steamId = ref("")
const ipAddress = ref("")
const reason = ref("")
const created_on = ref("")

const banPeriod = ref(0)

const options = [
  { label: "Permanent", value: 0 },
  { label: "1 Day", value: 1 },
  { label: "1 Week", value: 7 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
]

const banPeriodOptions = computed(() => {
  return options.filter(
    (option) => option.value >= banPeriod.value || option.value === 0
  )
})

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

      steamId.value = data.steam_id
      ipAddress.value = data.ip_address
      reason.value = data.reason
      created_on.value = data.created_on
      let duration = Math.floor(
        (new Date(data.expires_on).getTime() -
          new Date(data.created_on).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      banPeriod.value = options.find((option) => option.value === duration)
        ? duration
        : 0
    } catch (error) {
      console.log(error)
    }
  }
})

async function saveBan() {
  loading.value = true

  try {
    let expiresOn = null
    if (banPeriod.value === 0) {
      expiresOn = "9999-12-31T23:59:59.999Z"
    } else {
      expiresOn = new Date(
        new Date(created_on.value).getTime() +
          banPeriod.value * 24 * 60 * 60 * 1000
      ).toISOString()
    }

    if (route.params.id) {
      await axiosClient.patch(`/bans/${route.params.id}`, {
        reason: reason.value,
        expires_on: expiresOn,
      })
    } else {
      console.log(steamId.value, ipAddress.value, reason.value)

      await axiosClient.post("/bans", {
        steam_id: steamId.value,
        ip_address: ipAddress.value,
        reason: reason.value,
      })
    }

    message.success("Ban issued", { duration: 2000 })
    router.push("/home/bans")
  } catch (error) {
    console.log(error)
    message.error("Failed to issue ban.", { duration: 2000 })
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
