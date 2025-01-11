<template>
  <div class="mb-4 rounded-md bg-gray-800 p-4">
    <n-form ref="adminForm" :model="admin" :rules="rules">
      <n-form-item label="Steam ID" path="id">
        <n-input v-model:value="admin.id" placeholder="" />
      </n-form-item>
    </n-form>

    <div class="mb-4">
      <p class="mb-2">Permissions</p>
      <n-select
        v-model:value="admin.permissions"
        multiple
        placeholder="Select Permission"
        :options="permissionOptions"
      />
    </div>

    <n-button @click.prevent="createAdmin" :disabled="loading" :loading="loading" type="primary" strong
      >Create</n-button
    >
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { NSelect, NButton, NInput, NForm, NFormItem, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"

const router = useRouter()
const notification = useNotification()

const loading = ref(false)

const adminForm = ref<FormInst | null>(null)
const admin = reactive({
  id: "",
  permissions: [],
})

const rules = {
  id: {
    required: true,
    message: "Steam ID is required.",
    trigger: ["input", "blur"],
  },
}

const permissionOptions = [
  { label: "map-pool", value: "map-pool" },
  { label: "servers", value: "servers" },
  { label: "player-bans", value: "player-bans" },
  { label: "user-permissions", value: "user-permissions" },
]

function createAdmin() {
  loading.value = true

  adminForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.put(
          `/users/${admin.id}/permissions`,
          { permissions: admin.permissions },
          { withCredentials: true },
        )
        notification.success({ title: "Admin saved", duration: 3000 })
        router.push("/admins")
      } catch (error) {
        loading.value = false
        notification.error({
          title: "Failed to create admin",
          content: toErrorMsg(error),
        })
      }
    } else {
      loading.value = true
      notification.error({ title: "Missing Fields" })
    }
  })
}
</script>
