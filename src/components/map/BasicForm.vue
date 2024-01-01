<template>
  <div>
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-placement="top"
      label-width="auto"
      require-mark-placement="right-hanging"
      size="medium"
      :style="{
        maxWidth: '640px',
      }"
    >
      <n-form-item label="Map" path="name">
        <n-input v-model:value="model.name" placeholder="kz_aaaa" />
      </n-form-item>
      <n-form-item label="Workshop ID" path="workshop_id">
        <n-input v-model:value="model.workshop_id" placeholder="123456789" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { NForm, NFormItem, NInput, FormInst } from "naive-ui"

const formRef = ref<FormInst | null>(null)
const model = ref({
  name: null,
  workshop_id: null,
})

const rules = {
  name: {
    required: true,
    trigger: ["blur", "input"],
    message: "Map name is required.",
  },
  // TODO: validate workshop id
  workshop_id: {
    required: true,
    trigger: ["blur", "input"],
    message: "Invalid workshop id.",
  },
}
</script>
