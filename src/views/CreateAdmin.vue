<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <n-form ref="adminForm" :model="admin" :rulse="rules">
      <n-form-item label="Steam ID" path="steamId">
        <n-input v-model:value="admin.steamId" placeholder="" />
      </n-form-item>
    </n-form>

    <div class="mb-4">
      <p class="mb-2">Roles</p>
      <n-select
        v-model:value="admin.roles"
        multiple
        placeholder="Select Role"
        :options="roleOptions"
      />
    </div>

    <n-button
      @click.prevent="createAdmin"
      :disabled="loading"
      :loading="loading"
      style="font-size: 16px"
      text-color="#3cc962"
      size="large"
      strong
      bordered
      >Create</n-button
    >
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import {
  NSelect,
  NButton,
  NInput,
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

const adminForm = ref<FormInst | null>(null)
const admin = reactive({
  steamId: "",
  roles: [],
})

const rules = {
  steamId: {
    required: true,
    message: "Steam ID is required.",
    trigger: ["input", "blur"],
  },
}

const roleOptions = [
  { label: "maps", value: "maps" },
  { label: "servers", value: "servers" },
  { label: "bans", value: "bans" },
  { label: "admin", value: "admin" },
]

function createAdmin() {
  loading.value = true

  adminForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.put(
          `/admins/${admin.steamId}`,
          { roles: admin.roles },
          { withCredentials: true },
        )
        notification.success({ title: "Admin saved", duration: 3000 })
        router.push("/home/admins")
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
