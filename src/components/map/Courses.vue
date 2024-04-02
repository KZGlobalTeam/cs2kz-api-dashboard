<template>
  <div
    v-for="(course, index) in courses"
    :key="course.id"
    class="p-4 bg-gray-900 border border-slate-600 rounded-md mb-4"
  >
    <div
      class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2"
    >
      <p class="font-medium text-xl">
        {{ `Course ${index + 1}` }}
      </p>
      <n-button @click="deleteCourse(index)" text-color="#e2e8f0" type="error"
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
        placeholder=""
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
import { Ref } from "vue"
import { NButton, NInput, useDialog } from "naive-ui"
import Mappers from "./Mappers.vue"
import Filters from "./Filters.vue"
import type { Course } from "../../types"

const courses = defineModel<Course[]>("courses") as Ref<Course[]>

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
