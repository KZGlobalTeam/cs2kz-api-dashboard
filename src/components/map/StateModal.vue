<template>
  <n-modal v-model:show="showModal">
    <n-card style="width: 600px" title="Modify Stateissions" :bordered="false" role="dialog" aria-modal="true">
      <n-form ref="formRef" inline :model="formModel">
        <n-form-item label="State" path="state">
          <n-select v-model:value="formModel.state" :options="stateOptions" style="width: 200px" />
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
import type { MapState, Map } from "../../types"
import { toErrorMsg } from "../../utils"

const states = ["wip", "pending", "approved", "graveyard", "completed"]

const stateOptions = states.map((state) => ({ label: state, value: state }))

const props = defineProps<{
  map: Map | null
}>()

const showModal = defineModel<boolean>("show")

const emits = defineEmits(["update:success"])

const notification = useNotification()

const formRef = ref<FormInst | null>(null)

const formModel = reactive<{ state: MapState }>({
  state: "wip",
})

watch(
  () => props.map,
  (map) => {
    if (map) {
      formModel.state = map.state
    }
  },
)

const submitForm = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await axiosClient.put(
          `/maps/${props.map!.id}/state`,
          {
            state: formModel.state,
          },
          { withCredentials: true },
        )
        emits("update:success")
        notification.success({ title: "Map state updated", duration: 3000 })
      } catch (error) {
        notification.error({
          title: "Failed to update map state",
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
