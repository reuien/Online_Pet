<template>
  <div class="min-h-screen pixel-bg relative">
    <FloatingDecorations />
    <div class="max-w-4xl mx-auto relative z-10">
      <Nav />
      <main class="p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Nav from './components/Nav.vue'
import FloatingDecorations from './components/FloatingDecorations.vue'
</script>

<style scoped>
.pixel-bg {
  background-image:
    linear-gradient(rgba(26, 26, 46, 0.95), rgba(26, 26, 46, 0.95)),
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232a2a4a' fill-opacity='0.4'%3E%3Cpath d='M0 0h1v1H0zM10 10h1v1h-1zM5 15h1v1H5zM15 5h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
