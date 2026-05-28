<template>
  <nav class="flex gap-2 p-4 border-b-2 border-[#3a3a5a] bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-50">
    <router-link to="/" custom v-slot="{ navigate, isActive }">
      <PxButton :type="isActive ? 'primary' : 'default'" @click="navigate">
        <template #icon>
          <PxIcon icon="home" size="sm" />
        </template>
        广场
      </PxButton>
    </router-link>
    <router-link to="/create" custom v-slot="{ navigate, isActive }">
      <PxButton :type="isActive ? 'primary' : 'default'" @click="navigate">
        <template #icon>
          <PxIcon icon="arrow-right" size="sm" />
        </template>
        创建
      </PxButton>
    </router-link>
    <router-link to="/leaderboard" custom v-slot="{ navigate, isActive }">
      <PxButton :type="isActive ? 'primary' : 'default'" @click="navigate">
        <template #icon>
          <PxIcon icon="sliders" size="sm" />
        </template>
        排行榜
      </PxButton>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { PxButton, PxIcon } from 'sakana-element'
</script>
