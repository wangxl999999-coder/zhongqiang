<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <AppLayout v-if="!isAuthPage(route.path)">
        <component :is="Component" />
      </AppLayout>
      <component v-else :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import AppLayout from './components/AppLayout.vue'

const isAuthPage = (path) => {
  return ['/login', '/register', '/select-tags'].includes(path)
}
</script>

<style>
</style>
