<template>
  <n-modal
    @close="redirect"
    :show="showModal"
    style="width: 600px"
    preset="card"
    :mask-closable="false"
    title="API Key"
  >
    <div
      @click="handleClickApiKey"
      class="w-max px-2 py-1 bg-gray-700 hover:bg-gray-800 text-2xl text-green-600 hover:text-green-700 rounded-md cursor-pointer"
    >
      {{ apiKey }}
    </div>

    <p class="mt-6 text-lg">
      The API key will be displayed only <strong>once</strong>. Please copy and
      save it securely. <br />
      <strong>Do not</strong> share your API key with anyone else or expose it
      publicly. <br />
      If you suspect your key has been compromised, you can revoke it or
      generate a new one in the dashboard.
    </p>
  </n-modal>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { NModal, useNotification } from "naive-ui"

const props = defineProps<{
  apiKey: string
  showModal: boolean
  redirectTo: string
}>()

const router = useRouter()
const notification = useNotification()

function handleClickApiKey() {
  navigator.clipboard.writeText(props.apiKey)
  notification.info({ title: "Saved to clipboard!", duration: 2000 })
}

function redirect() {
  router.push({ name: props.redirectTo })
}
</script>
