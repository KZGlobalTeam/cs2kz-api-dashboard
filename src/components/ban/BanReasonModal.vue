<template>
  <n-modal v-model:show="showModal">
    <n-card style="width: 600px" title="Revert Ban" :bordered="false" role="dialog" aria-modal="true">
      <n-form ref="formRef" inline :model="formModel">
        <n-form-item label="Reason" path="reason">
          <n-input v-model:value="formModel.reason" placeholder="" style="width: 200px" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">Cancel</n-button>
          <n-button type="primary" @click="submitForm">OK</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard, NButton, NForm, NFormItem, NInput, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import { reactive, ref } from "vue"
import axiosClient from "../../axios"
import type { Ban } from "../../types"
import { toErrorMsg } from "../../utils"

const props = defineProps<{
  ban: Ban | null
}>()

const showModal = defineModel<boolean>("show")

const emits = defineEmits(["revert:success"])

const notification = useNotification()

const formRef = ref<FormInst | null>(null)

const formModel = reactive({
  reason: "",
})

const submitForm = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.delete(`/bans/${props.ban!.id}`, {
          data: { reason: formModel.reason },
          withCredentials: true,
        })
        emits("revert:success")
        notification.success({ title: "Ban reverted", duration: 3000 })
      } catch (error) {
        notification.error({
          title: "Failed to revert ban",
          content: toErrorMsg(error),
        })
      }
      showModal.value = false
    } else {
      notification.error({ title: "Missing Fields" })
    }
  })
}
</script>
