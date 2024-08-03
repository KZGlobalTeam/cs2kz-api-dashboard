<template>
  <div class="text-slate-200">KREEDZ.</div>
</template>

<script setup lang="ts">
import { usePlayerStore } from "../store/player"

const playerStore = usePlayerStore()

playerStore.readCookie()
playerStore.getPermissions()
</script>
