<template>
  <div
    class="flex h-16 w-full items-center justify-between border-b border-b-slate-700 bg-gray-900 px-8 py-2 shadow-md"
  >
    <p class="text-xl font-semibold">CS2KZ API</p>

    <div>
      <div class="flex gap-4" v-if="playerStore.steamId">
        <!-- avatar -->
        <img
          class="h-8 w-8 rounded-full ring-2 ring-slate-700"
          :src="playerStore.avatar_url"
        />
        <div>
          <n-button secondary type="warning" @click="signOut" strong
            >SIGN OUT</n-button
          >
        </div>
      </div>
      <div v-else>
        <n-button secondary type="success" @click="playerStore.signIn" strong
          >SIGN IN</n-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"
import { useRouter } from "vue-router"
import { usePlayerStore } from "../store/player"

const router = useRouter()

const playerStore = usePlayerStore()

async function signOut() {
  await playerStore.signOut()
  router.push("/")
}
</script>
