<template>
  <div v-for="(course, key) in courses" :key="key" class="mb-4 rounded-md border border-slate-600 bg-gray-900 p-4">
    <div class="flex items-center justify-between gap-2 border-b border-slate-600 pb-2">
      <p class="text-xl font-medium">
        {{ `Course ${Number(key) + 1}` }}
      </p>
      <n-button @click="deleteCourse(key as string)" type="error" tertiary>Delete</n-button>
    </div>

    <div class="mb-4">
      <p class="my-2">Name</p>
      <n-input v-model:value="course.name" placeholder="" />
    </div>

    <!-- description -->
    <div class="mb-4">
      <p class="mb-2">Description</p>
      <n-input type="textarea" v-model:value="course.description" autosize placeholder="Optional" />
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
import type { NewCourses } from "../../types"

const courses = defineModel<NewCourses | null>("courses", { required: true })

const dialog = useDialog()

function deleteCourse(key: string) {
  dialog.warning({
    title: "Warning",
    content: "Are you sure you want to delete this course?",
    class: "font-poppings",
    positiveText: "Yes",
    negativeText: "Cancel",
    onPositiveClick: () => {
      const values = Object.values(courses.value!)
      values.splice(parseInt(key), 1)

      const entries = []
      for (let i = 0; i < values.length; i++) {
        entries.push([i.toString(), values[i]])
      }
      const updatedCourses = Object.fromEntries(entries)
      courses.value = updatedCourses
    },
  })
}
</script>
