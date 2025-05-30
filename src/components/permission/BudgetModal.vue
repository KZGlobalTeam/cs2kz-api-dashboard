<template>
  <n-modal v-model:show="showModal">
    <n-card style="width: 600px" title="Mark As Mapper" :bordered="false" role="dialog" aria-modal="true">
      <n-form ref="formRef" inline :model="formModel" :rules="rules">
        <n-form-item label="Budget" path="budget">
          <n-input-number v-model:value="formModel.budget" placeholder="" style="width: 200px" />
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
import { NModal, NCard, NForm, NButton, NFormItem, NInputNumber, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import { reactive, ref, watch } from "vue"
import axiosClient from "../../axios"
import type { User } from "../../types"
import { toErrorMsg } from "../../utils"
import { usePlayerStore } from "../../store/player"

const props = defineProps<{
  user: User | null
}>()

const showModal = defineModel<boolean>("show")

const emits = defineEmits(["update:success"])

const rules = {
  budget: {
    required: true,
    trigger: ["input", "blur"],
    validator(_rule: any, value: number) {
      if (value < 0) {
        return new Error("Server budget must be greater than or equal to 0")
      }
      return true
    },
  },
}

const playerStore = usePlayerStore()

const notification = useNotification()

const formRef = ref<FormInst | null>(null)

const formModel = reactive({
  budget: 0,
})

watch(
  () => props.user,
  (user) => {
    if (user) {
      formModel.budget = user.server_budget
    }
  },
)

const submitForm = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.put(
          `/users/${props.user!.id}/server-budget`,
          {
            budget: formModel.budget,
          },
          { withCredentials: true },
        )
        if (playerStore.steamId === props.user!.id) {
          playerStore.readPlayer()
        }
        notification.success({ title: "Server budget updated", duration: 3000 })
        emits("update:success")
      } catch (error) {
        notification.error({
          title: "Failed to update server budget",
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
