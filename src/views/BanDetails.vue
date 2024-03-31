<template>
  <div class="p-4 bg-gray-800 mb-4 rounded-md">
    <n-space vertical v-if="ban">
      <div>
        <p class="title">Player</p>
        <p>{{ `${ban.player.name}, ${ban.player.steam_id}` }}</p>
      </div>

      <div>
        <p class="title">Reason</p>
        <p>
          {{
            ban.reason
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          }}
        </p>
      </div>

      <div v-if="ban.server">
        <p class="title">Server ID</p>
        <p>{{ ban.server?.id }}</p>
      </div>

      <div v-if="ban.server">
        <p class="title">Server Name</p>
        <p>{{ ban.server.name }}</p>
      </div>

      <div v-if="ban.server">
        <p class="title">Server Owner</p>
        <p>
          {{ `${ban.server.owner.name}, ${ban.server.owner.steam_id}` }}
        </p>
      </div>

      <div v-if="ban.admin">
        <p class="title">Banned By</p>
        <p>{{ `${ban.admin.name}, ${ban.admin.steam_id}` }}</p>
      </div>

      <div>
        <p class="title">Created On</p>
        <p>
          {{ toLocal(ban.created_on) }}
        </p>
      </div>

      <div>
        <p class="title">Expires On</p>
        <p>
          {{ ban.expires_on ? toLocal(ban.expires_on) : "Permanent" }}
        </p>
      </div>

      <div v-if="ban.unban">
        <p class="title">Unban Created On</p>
        <p>{{ toLocal(ban.unban.created_on) }}</p>
      </div>

      <div v-if="ban.unban?.admin">
        <p class="title">Unbanned By</p>
        <p>
          {{ `${ban.unban.admin.name}, ${ban.unban.admin.steam_id}` }}
        </p>
      </div>

      <div v-if="ban.unban">
        <p class="title">Unban Reason</p>
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
import { NSpace, useNotification } from "naive-ui"
import { Ban } from "../types"
import { toErrorMsg, toLocal } from "../utils"

const route = useRoute()

const notification = useNotification()

const ban = ref<Ban>()

onBeforeMount(async () => {
  if (route.params.id) {
    try {
      const { data } = (await axiosClient.get(
        `/bans/${route.params.id}`,
      )) as AxiosResponse<Ban>
      // console.log(data);

      ban.value = data
    } catch (error) {
      notification.error({
        title: "Failed to fetch ban details",
        content: toErrorMsg(error),
      })
    }
  }
})
</script>

<style scoped>
.title {
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.55rem;
  color: #ababab;
}
</style>
