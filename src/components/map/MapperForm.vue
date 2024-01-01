<template>
  <div>
    <n-form :model="model">
      <p class="mb-2">Mappers</p>
      <n-dynamic-input
        v-model:value="model.mappers"
        item-style="margin-bottom: 0;"
        :on-create="onCreate"
        #="{ index }"
      >
        <div class="flex gap-4">
          <n-form-item
            ignore-path-change
            :show-label="false"
            :path="`mappers[${index}].name`"
            :rule="mapperNameRule"
          >
            <n-input
              v-model:value="model.mappers[index].name"
              placeholder="Name"
              @keydown.enter.prevent
            />
          </n-form-item>
          <n-form-item
            ignore-path-change
            :show-label="false"
            :path="`mappers[${index}].steam_id`"
            :rule="mapperSteamIdRule"
          >
            <n-input
              v-model:value="model.mappers[index].steam_id"
              placeholder="Steam ID"
              @keydown.enter.prevent
            />
          </n-form-item>
        </div>
      </n-dynamic-input>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { NDynamicInput, NInput, NFormItem, NForm } from "naive-ui"

const model = ref({ mappers: [{ name: "", steam_id: "" }] })

const mapperNameRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Name is required.",
}

// TODO: validate steam id
const mapperSteamIdRule = {
  required: true,
  trigger: ["blur", "input"],
  message: "Invalid Steam ID.",
}

function onCreate() {
  return {
    name: "",
    steam_id: "",
  }
}
</script>
