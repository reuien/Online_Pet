<template>
  <div class="flex items-center gap-1.5">
    <span class="text-[10px] text-neutral-400 w-8">{{ label }}</span>
    <div class="flex-1 h-3 bg-[#1a1a2e] border-2 border-[#3a3a5a] overflow-hidden relative">
      <!-- Pixel blocks -->
      <div class="flex h-full">
        <div
          v-for="i in 20"
          :key="i"
          class="h-full border-r border-[#1a1a2e]"
          :class="{ 'opacity-0': i > filledBlocks }"
          :style="{ width: blockWidth + '%', backgroundColor: color }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
  color: string
}>()

const filledBlocks = computed(() => Math.round((props.value / 100) * 20))
const blockWidth = computed(() => 100 / 20)
</script>
