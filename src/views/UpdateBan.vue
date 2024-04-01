<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <div class="mb-4">
        <p class="mb-2 font-medium">Reason</p>
        <n-select v-model:value="ban.reason" :options="banReasonOptions" />
      </div>

      <div class="mb-4">
        <p class="mb-2 font-medium">Ban Duration</p>
        <n-select
          v-model:value="ban.banDuration"
          :options="banDurationOptions"
        />
      </div>

      <div>
        <n-button
          @click.prevent="updateBan"
          :disabled="loading"
          :loading="loading"
          class="saveButton"
          text-color="#3cc962"
          style="font-size: 16px"
          size="large"
          strong
          bordered
          >Update</n-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, toRaw } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NButton, NSelect, useNotification } from "naive-ui"
import type { Ban } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { getDiff, toErrorMsg, calcBanDuration } from "../utils"
import { isEqual } from "lodash-es"

const router = useRouter()
const route = useRoute()
const notification = useNotification()

const loading = ref(false)

let oldBan: Record<string, string>

const ban = reactive<{
  reason: string
  banDuration: number | string
  createdOn: string
}>({
  reason: "",
  banDuration: 1,
  createdOn: "",
})

const banReasonOptions = [
  { label: "Auto Bhop", value: "auto_bhop" },
  { label: "Auto Strafe", value: "auto_strafe" },
]

const banDurationOptions = [
  { label: "1 Day", value: 1 },
  { label: "1 Week", value: 7 },
  { label: "2 Weeks", value: 14 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
  { label: "Permanent", value: "permanent" },
]

onBeforeMount(async () => {
  try {
    const { data } = (await axiosClient.get(
      `/bans/${route.params.id}`,
    )) as AxiosResponse<Ban>
    // console.log(data);

    ban.reason = data.reason
    ban.banDuration = calcBanDuration(data)
    ban.createdOn = data.created_on

    oldBan = JSON.parse(JSON.stringify(ban))
  } catch (error) {
    notification.error({
      title: "Failed to fetch the ban",
      content: toErrorMsg(error),
    })
  }
})

async function updateBan() {
  if (isEqual(oldBan, toRaw(ban))) {
    notification.error({ title: "No changes made" })
  } else {
    const diff = getDiff(oldBan, toRaw(ban))
    let update = diff

    if ("banDuration" in diff) {
      if (ban.banDuration === "permanent") {
        update = { ...diff, expires_on: null }
      } else {
        const expires_on = new Date(
          new Date(ban.createdOn).getTime() +
            (ban.banDuration as number) * 24 * 60 * 60 * 1000,
        ).toISOString()
        update = { ...diff, expires_on }
      }
    }

    loading.value = true

    try {
      await axiosClient.patch(`/bans/${route.params.id}`, update, {
        withCredentials: true,
      })
      notification.success({ title: "Ban issued", duration: 3000 })
      router.push("/home/bans")
    } catch (error) {
      loading.value = false
      notification.error({
        title: "Failed to issue the ban",
        content: toErrorMsg(error),
      })
    }
  }
}
</script>
