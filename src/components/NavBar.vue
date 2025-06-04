<template>
  <div class="menu min-h-screen bg-gray-800 px-2 py-4">
    <n-menu v-model:value="route.meta.title as string" :options="menuOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from "vue"
import { RouterLink } from "vue-router"
import { useRoute } from "vue-router"
import { NMenu } from "naive-ui"

const route = useRoute()

const activeKey = ref<string>("Home")

const menuItems = [
  {
    iconName: "home",
    path: "/",
    title: "Home",
  },
  {
    iconName: "map",
    path: "/maps",
    title: "Maps",
  },
  {
    iconName: "server",
    path: "/servers",
    title: "Servers",
  },
  {
    iconName: "ban",
    path: "/bans",
    title: "Bans",
  },
  {
    iconName: "person",
    path: "/permissions",
    title: "Permissions",
  },
]

const menuOptions = menuItems.map((item) => ({
  label: () =>
    h(
      "div",
      {
        class: "flex gap-2",
      },
      [
        h("img", {
          src: `/icons/${item.iconName}.svg`,
          class: "h-auto w-4",
        }),
        h(
          RouterLink,
          {
            to: `${item.path}`,
            class: "",
          },
          { default: () => item.title },
        ),
      ],
    ),
  key: item.title,
}))
</script>

<style scoped>
.menu :deep(.n-menu-item-content) {
  padding-left: 20px !important;
  height: 36px;
}
.menu :deep(.n-menu-item) {
  margin-top: 0;
}
</style>
