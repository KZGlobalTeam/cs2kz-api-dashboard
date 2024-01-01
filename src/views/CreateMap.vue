<template>
  <div>
    <div class="p-4 bg-gray-800 mb-4 rounded-md">
      <BasicForm />
      <MapperForm />
    </div>

    <div class="p-4 bg-gray-800 rounded-md">
      <CourseForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicForm from "../components/map/BasicForm.vue"
import MapperForm from "../components/map/MapperForm.vue"
import CourseForm from "../components/map/CourseForm.vue";
</script>
