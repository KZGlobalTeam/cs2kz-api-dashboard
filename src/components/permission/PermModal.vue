<template>
  <n-modal v-model:show="showModal">
    <n-card style="width: 600px" title="Modify Permissions" :bordered="false" role="dialog" aria-modal="true">
      <n-form ref="formRef" inline :model="formModel">
        <n-form-item label="Permission" path="permission">
          <n-select v-model:value="formModel.permissions" multiple :options="permOptions" style="width: 200px" />
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
import { NModal, NCard, NButton, NForm, NFormItem, NSelect, useNotification } from "naive-ui"
import type { FormInst } from "naive-ui"
import { reactive, ref, watch } from "vue"
import axiosClient from "../../axios"
import type { Permission, User } from "../../types"
import { toErrorMsg } from "../../utils"
import { usePlayerStore } from "../../store/player"

const permissions = [
  "create-maps",
  "update-maps",
  "modify-server-metadata",
  "modify-server-budgets",
  "reset-server-access-keys",
  "delete-server-access-keys",
  "create-bans",
  "update-bans",
  "revert-bans",
  "grant-create-maps",
  "modify-user-permissions",
]

const permOptions = permissions.map((perm) => ({ label: perm, value: perm }))

const props = defineProps<{
  user: User | null
}>()

const showModal = defineModel<boolean>("show")

const emits = defineEmits(["update:success"])

const notification = useNotification()

const playerStore = usePlayerStore()

const formRef = ref<FormInst | null>(null)

const formModel = reactive<{ permissions: Permission[] }>({
  permissions: [],
})

watch(
  () => props.user,
  (user) => {
    if (user) {
      formModel.permissions = user.permissions
    }
  },
)

const submitForm = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.put(
          `/users/${props.user!.id}/permissions`,
          {
            permissions: formModel.permissions,
          },
          { withCredentials: true },
        )
        if (playerStore.steamId === props.user!.id) {
          await playerStore.readPlayer()
        }
        emits("update:success")
        notification.success({ title: "User's permissions updated", duration: 3000 })
      } catch (error) {
        notification.error({
          title: "Failed to update user's permissions",
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
