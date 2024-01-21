<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <n-space vertical v-if="ban">
      <div>
        <p class="font-medium">Player</p>
        <p>{{ ban.steam_id }}</p>
      </div>

      <div>
        <p class="font-medium">Player IP</p>
        <p>{{ ban.ip_address }}</p>
      </div>

      <div>
        <p class="font-medium">Reason</p>
        <p>{{ ban.reason }}</p>
      </div>

      <div v-if="ban.server">
        <p class="font-medium">Server ID</p>
        <p>{{ ban.server?.id }}</p>
      </div>

      <div v-if="ban.server">
        <p class="font-medium">Server Name</p>
        <p>{{ ban.server.name }}</p>
      </div>

      <div v-if="ban.server">
        <p class="font-medium">Server Owner</p>
        <p>
          {{ `${ban.server.owned_by.name}, ${ban.server.owned_by.steam_id}` }}
        </p>
      </div>

      <div>
        <p class="font-medium">Plugin Version</p>
        <p>{{ ban.plugin_version }}</p>
      </div>

      <div>
        <p class="font-medium">Banned By</p>
        <p>{{ `${ban.banned_by.name}, ${ban.banned_by.steam_id}` }}</p>
      </div>

      <div>
        <p>Created On</p>
        <p>
          {{
            format(new Date(ban.created_on as string), "yyyy-MM-dd HH:mm:ss")
          }}
        </p>
      </div>

      <div>
        <p>Created On</p>
        <p>
          {{
            format(new Date(ban.expires_on as string), "yyyy-MM-dd HH:mm:ss")
          }}
        </p>
      </div>

      <div v-if="ban.unban">
        <p>Unbanned By</p>
        <p>
          {{
            `${ban.unban.unbanned_by.name}, ${ban.unban.unbanned_by.steam_id}`
          }}
        </p>
      </div>

      <div v-if="ban.unban">
        <p>Unban Reason</p>
        <p>{{ ban.unban.reason }}</p>
      </div>
    </n-space>

    <div v-else>No Data</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue"
import { useRoute } from "vue-router"
import axiosClient from "../axios"
import type { AxiosResponse } from "axios"
import { NSpace } from "naive-ui"
import { Ban } from "../types"
import { format } from "date-fns"

const route = useRoute()

const ban = ref<Ban>()

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/bans/${route.params.id}`
      )) as AxiosResponse<Ban>
      // console.log(data);
      
      ban.value = data
    } catch (error) {
      console.log(error)
    }
  }
})
</script>
