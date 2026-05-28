<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div
      v-for="(item, i) in decorations"
      :key="i"
      class="absolute twinkle-anim"
      :style="{
        left: item.left,
        top: item.top,
        animationDelay: `${i * 0.4}s`,
        fontSize: item.size,
      }"
    >
      {{ item.char }}
    </div>
  </div>
</template>

<script setup lang="ts">
const chars = ['✦', '✧', '★', '☆', '♦', '♠']
const decorations = Array.from({ length: 12 }, (_, i) => ({
  char: chars[i % chars.length],
  left: `${8 + (i * 7.5) % 85}%`,
  top: `${5 + (i * 13) % 80}%`,
  size: `${8 + (i % 3) * 4}px`,
}))
</script>

<style scoped>
.twinkle-anim {
  animation: twinkle 2s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
