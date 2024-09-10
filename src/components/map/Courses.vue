<template>
  <div
    v-for="(course, index) in courses"
    :key="course.id"
    class="mb-4 rounded-md border border-slate-600 bg-gray-900 p-4"
  >
    <div
      class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2"
    >
      <p class="text-xl font-medium">
        {{ `Course ${index + 1}` }}
      </p>
      <n-button
        v-if="removable"
        @click="deleteCourse(index)"
        type="error"
        tertiary
        >Delete</n-button
      >
    </div>

    <div class="mb-4">
      <p class="my-2">Name</p>
      <n-input v-model:value="course.name" placeholder="" />
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2">Description</p>
      <n-input
        type="textarea"
        v-model:value="course.description"
        autosize
        placeholder="Optional"
      />
    </div>

    <Mappers v-model:mappers="course.mappers" />

    <!-- filters -->
    <div class="mb-4">
      <p class="mb-2">Filters</p>
      <Filters v-model:filters="course.filters" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, useDialog } from "naive-ui"
import Mappers from "./Mappers.vue"
import Filters from "./Filters.vue"
import type { Course } from "../../types"

withDefaults(
  defineProps<{
    removable?: boolean
  }>(),
  { removable: true },
)

const courses = defineModel<Course[]>("courses", { required: true })

const dialog = useDialog()

function deleteCourse(index: number) {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to delete this course?",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: () => {
      courses.value.splice(index, 1)
    },
  })
}
</script>
