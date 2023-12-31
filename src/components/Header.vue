<template>
  <div class="flex items-center h-16 w-full justify-between py-2 px-8 bg-gray-900 border-b border-b-slate-700 shadow-md">
    <p class="text-xl font-semibold">CS2KZ-API</p>

    <div>
      <n-button @click="handleSignIn" text-color="#6dde6d" strong>SIGN IN</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { baseUrl } from '../types';
import { NButton } from 'naive-ui';

async function handleSignIn() {
  try {
    location.href = `${baseUrl}/auth/steam/login`
  } catch (error) {
    console.log(error);
  }
}
</script>