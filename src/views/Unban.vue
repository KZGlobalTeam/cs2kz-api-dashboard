<template>
  <div class="mb-4 rounded-md bg-gray-800 p-4">
    <n-form ref="unbanForm" :model="unban" :rules="unbanRules">
      <n-form-item label="Unban Reason" path="reason">
        <n-input v-model:value="unban.reason" placeholder="" />
      </n-form-item>
    </n-form>

    <div>
      <n-button
        @click.prevent="revertBan"
        :disabled="loading"
        :loading="loading"
        class="saveButton"
        type="primary"
        strong
        >Unban</n-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { NForm, NFormItem, NButton, NInput, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import axiosClient from "../axios"
import { toErrorMsg } from "../utils"

const route = useRoute()
const router = useRouter()

const notification = useNotification()

const loading = ref(false)

const unbanForm = ref<FormInst | null>(null)

const unban = reactive({
  reason: "",
})

const unbanRules = {
  reason: {
    required: true,
    message: "Unban reason is required.",
    trigger: ["input", "blur"],
  },
}

async function revertBan() {
  loading.value = true

  unbanForm.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.delete(`/bans/${route.params.id}`, {
          data: unban,
          withCredentials: true,
        })
        notification.success({ title: "Ban reverted", duration: 3000 })
        router.push("/home/bans")
      } catch (error) {
        loading.value = false
        notification.error({
          title: "Failed to revert the ban",
          content: toErrorMsg(error),
        })
      }
    } else {
      loading.value = false
      notification.error({ title: "Missing Fields" })
    }
  })
}
</script>
