<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <div class="mb-4">
      <p class="mb-2">Permissions</p>
      <n-select
        v-model:value="admin.permissions"
        multiple
        placeholder="Select Permission"
        :options="permissionOptions"
      />
    </div>

    <n-button
      @click.prevent="updateAdmin"
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
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NSelect, NButton, useNotification } from "naive-ui"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"

const router = useRouter()
const route = useRoute()
const notification = useNotification()

const loading = ref(false)

const admin = reactive({
  permissions: [],
})

const permissionOptions = [
  { label: "maps", value: "maps" },
  { label: "servers", value: "servers" },
  { label: "bans", value: "bans" },
  { label: "admin", value: "admin" },
]

onBeforeMount(async () => {
  let steamId = route.params.steam_id
  try {
    const { data } = await axiosClient.get(`/admins/${steamId}`)

    admin.permissions = data.permissions
  } catch (error) {
    notification.error({
      title: "Failed to fetch admins",
      content: toErrorMsg(error),
    })
  }
})

async function updateAdmin() {
  loading.value = true

  try {
    await axiosClient.put(
      `/admins/${route.params.steam_id}`,
      { permissions: admin.permissions },
      { withCredentials: true },
    )
    notification.success({ title: "Admin updated", duration: 3000 })
    router.push("/home/admins")
  } catch (error) {
    loading.value = false
    notification.error({
      title: "Failed to update admin",
      content: toErrorMsg(error),
    })
  }
}
</script>
