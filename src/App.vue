<template>
  <div class="font-poppings text-slate-200">
    <n-config-provider :theme="darkTheme" :locale="enUS">
      <Header />
      <div class="flex">
        <NavBar />
        <div class="flex-1 bg-gray-900 p-4">
          <div class="flex mb-4">
            <div class="flex items-center mr-1" v-for="(part, index) in pathArray" :key="index">
              <RouterLink class="mr-1"
                :class="index !== pathArray.length - 1 ? 'bg-gray-800 hover:bg-gray-700 text-green-600 py-1 px-[10px] rounded-md' : 'cursor-default'"
                :to="getLink(index)">{{ part }}
              </RouterLink>
              <ion-icon v-if="index !== pathArray.length - 1" size="" name="chevron-forward-sharp"></ion-icon>
            </div>
          </div>
          <RouterView />
        </div>
      </div>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
import NavBar from './components/NavBar.vue';
import { RouterView, useRoute } from 'vue-router';
import { onBeforeMount, computed } from 'vue'
import { darkTheme, NConfigProvider, enUS } from 'naive-ui';
import { useAdminStore } from './store/admin';

const adminStore = useAdminStore()
const route = useRoute()

onBeforeMount(() => {
  adminStore.name = 'jonabird'
  adminStore.steamId = '123'
})

const pathArray = computed(() => route.path.split('/').filter(item => item !== '').map(item => item.charAt(0).toUpperCase() + item.slice(1)))

function getLink(index: number) {
  const path = pathArray.value.slice(0, index + 1).join('/').toLowerCase();
  return '/' + path;
}
</script>

<style scoped>
ion-icon {
  font-size: 32
}
</style>