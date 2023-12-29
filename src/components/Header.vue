<template>
  <div class="flex items-center h-16 w-full justify-between py-2 px-8 bg-gray-900 border-b border-b-slate-700">
    <p class="text-slate-200 text-xl font-semibold">CS2KZ-API</p>

    <div>
      <n-button @click="handleSignIn" text-color="#e2e8f0" strong>SIGN IN</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

async function handleSignIn() {
  try {
    location.href = 'http://106.14.107.95:42069/auth/steam/login'
  } catch (error) {
    console.log(error);
  }
}
</script>