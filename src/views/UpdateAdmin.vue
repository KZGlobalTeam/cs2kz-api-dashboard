<template>
  <div class="mb-4 rounded-md bg-gray-800 p-4">
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
      type="primary"
      strong
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
  { label: "map-pool", value: "map-pool" },
  { label: "servers", value: "servers" },
  { label: "player-bans", value: "player-bans" },
  { label: "user-permissions", value: "user-permissions" },
]

onBeforeMount(async () => {
  let id = route.params.id
  try {
    const { data } = await axiosClient.get(`/users/${id}`)

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
      `/users/${route.params.id}/permissions`,
      { permissions: admin.permissions },
      { withCredentials: true },
    )
    notification.success({ title: "Permissions updated", duration: 3000 })
    router.push("/admins")
  } catch (error) {
    loading.value = false
    notification.error({
      title: "Failed to update admin",
      content: toErrorMsg(error),
    })
  }
}
</script>
