<template>
  <div>
    <div v-for="fooBars in foos">
      <div v-for="bar in fooBars" :key="bar.id">
        <n-input v-model:value="bar.text" placeholder="123456789" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { NInput } from "naive-ui"
const foos = ref([
  [
    { id: 1, text: "bar" },
    { id: 2, text: "bar" },
    { id: 3, text: "bar" },
  ],
  [
    { id: 1, text: "bar" },
    { id: 2, text: "bar" },
    { id: 3, text: "bar" },
  ],
  [
    { id: 1, text: "bar" },
    { id: 2, text: "bar" },
    { id: 3, text: "bar" },
  ],
])
</script>
