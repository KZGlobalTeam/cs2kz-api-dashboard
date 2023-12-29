<template>
  <div class="font-poppings">
    <Header />
    <div>
      <NavBar />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
import NavBar from './components/NavBar.vue';
import { RouterView } from 'vue-router';
</script>