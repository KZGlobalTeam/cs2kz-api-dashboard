<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <n-form v-if="!editing" ref="adminForm" :model="admin" :rulse="rules">
      <n-form-item label="Steam ID" path="steamId">
        <n-input v-model:value="admin.steamId" placeholder="" />
      </n-form-item>
    </n-form>

    <div class="mb-4">
      <p class="mb-2">Roles</p>
      <n-select v-model:value="admin.roles" multiple placeholder="Select Role" :options="roleOptions" />
    </div>

    <n-button @click.prevent="saveAdmin" :disabled="loading" :loading="loading" class="saveButton" text-color="#3cc962"
      size="large" strong bordered>Save</n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  NSelect,
  NButton,
  NInput,
  NForm,
  NFormItem,
  useMessage,
} from "naive-ui"
import type { FormInst } from "naive-ui"
import axiosClient from "../axios"

const router = useRouter()
const route = useRoute()
const message = useMessage()

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

const editing = computed(() => {
  return route.params.steam_id ? true : false
})

const roleOptions = [
  { label: "maps", value: "maps" },
  { label: "servers", value: "servers" },
  { label: "bans", value: "bans" },
  { label: "admin", value: "admin" },
]

onBeforeMount(async () => {
  let steamId = route.params.steam_id
  if (route.params.steam_id) {
    try {
      const { data } = await axiosClient.get(`/admins/${steamId}`)
      // console.log(data);

      admin.steamId = steamId as string
      admin.roles = data.roles
    } catch (error) {
      console.log(error)
    }
  }
})

function saveAdmin() {
  if (adminForm.value) {
    adminForm.value.validate((errors) => {
      if (!errors) {
        submitAdmin()
      } else {
        console.log(errors)
      }
    })
  } else {
    submitAdmin()
  }
}

async function submitAdmin() {
  loading.value = true

  try {
    await axiosClient.put(`/admins/${admin.steamId}`, { roles: admin.roles }, { withCredentials: true })
    message.success("Admin saved", { duration: 2000 })
    router.push("/home/admins")
  } catch (error) {
    console.log(error)
    message.error("Failed to save admin", { duration: 2000 })
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
