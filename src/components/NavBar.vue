<template>
  <div class="w-[200px] bg-gray-800 min-h-screen flex flex-col py-4 px-2">
    <RouterLink to="/home" class="flex gap-4 items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <ion-icon name="home-sharp"></ion-icon>
      <p class="font-medium">Home</p>
    </RouterLink>

    <RouterLink to="/home/maps" class="flex gap-4 items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <ion-icon name="map-sharp"></ion-icon>
      <p class="font-medium">Maps</p>
    </RouterLink>

    <RouterLink to="/home/servers" class="flex gap-4 items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <ion-icon name="server-sharp"></ion-icon>
      <p class="font-medium">Servers</p>
    </RouterLink>

    <RouterLink to="/home/bans" class="flex gap-4 items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <ion-icon name="ban-sharp"></ion-icon>
      <p class="font-medium">Bans</p>
    </RouterLink>

    <RouterLink to="/home/jumpstats" class="flex gap-4 items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer">
      <ion-icon name="stats-chart-sharp"></ion-icon>
      <p class="font-medium">Jumpstats</p>
    </RouterLink>

  </div>
</template>

<script setup lang="ts">


</script>

<style scoped>
ion-icon {
  font-size: 32
}
</style>