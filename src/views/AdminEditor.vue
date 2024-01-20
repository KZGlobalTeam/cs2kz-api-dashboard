<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <div v-if="editing" class="mb-4">
        <p class="mb-2 font-semibold text-lg">{{ name }}</p>
      </div>

      <div class="mb-4">
        <p class="mb-2">Steam ID</p>
        <n-input v-model:value="steamId" placeholder="" />
      </div>

      <div class="">
        <p class="mb-2 font-medium">Roles</p>
        <n-select
          v-model:value="roles"
          multiple
          placeholder="Select Role"
          :options="roleOptions"
        />
      </div>
    </div>

    <!-- save map -->
    <div class="p-4 bg-gray-800 rounded-md">
      <n-button
        @click.prevent="saveAdmin"
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
import { ref, onBeforeMount, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { NSelect, NButton, NInput, useMessage } from "naive-ui"
import { Role, Admin } from "../types"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"

const router = useRouter()
const route = useRoute()
const message = useMessage()

const loading = ref(false)

const name = ref("")
const steamId = ref("")
const roles = ref<Role[]>([])

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
  if (route.params.steam_id) {
    try {
      const { data } = (await axiosClient.get(
        `/auth/admins/${route.params.steam_id}`
      )) as AxiosResponse<Admin>
      // console.log(data);

      name.value = data.name
      steamId.value = data.steam_id
      roles.value = data.roles
    } catch (error) {
      console.log(error)
    }
  }
})

async function saveAdmin() {
  loading.value = true

  try {
    const data = {
      steam_id: steamId.value,
      roles: roles.value,
    }
    console.log(data)

    await axiosClient.put("/auth/admins", data)
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
