<template>
  <div class="pet-avatar" :style="{ width: pxSize + 'px', height: pxSize + 'px' }">
    <div class="pixel-canvas" :style="canvasStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  species: string
  size?: number
}>()

const pxSize = computed(() => props.size || 28)
const pixel = computed(() => Math.max(2, Math.round(pxSize.value / 14)))

/*
  14x14 pixel art for each species.
  Each string: space = transparent, letter = color from palette.
  Palette: B=black(outline), W=white, C=main color, L=light, D=dark, E=eye, P=pink
*/
const patterns: Record<string, string[]> = {
  cat: [
    '              ',
    '    B    B    ',
    '   BBB  BBB   ',
    '  BBBBBBBBBB  ',
    ' BWWBBBBBBWWB ',
    ' BWWBBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BCBCCCCCCBCB ',
    ' BCCCCCCCCCCB ',
    ' BCCCCCCCCCCB ',
    ' BCCCCCCCCCCB ',
    '  BCCCCCCCCB  ',
    '   BBBBBBBB   ',
    '              ',
  ],
  dog: [
    '              ',
    '   BBB    BBB ',
    '  BWWB   BWWB ',
    ' BWWWB   BWWWB',
    ' BBBBBBBBBBBBB',
    ' BWWBBBBBBWWB ',
    ' BWWBBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BCBCCCCCCBCB ',
    ' BCCCCCCCCCCB ',
    ' BCCCCCCCCCCB ',
    '  BCCCCCCCCB  ',
    '   BBBBBBBB   ',
    '              ',
  ],
  rabbit: [
    '   BB     BB  ',
    '  BWWB   BWWB ',
    '  BWWB   BWWB ',
    '  BWWB   BWWB ',
    '  BWWB   BWWB ',
    '  BWWBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BWWBBBBBBWWB ',
    ' BWWBBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BCCCCCCCCCCB ',
    ' BCCCCCCCCCCB ',
    '  BCCCCCCCCB  ',
    '   BBBBBBBB   ',
  ],
  hamster: [
    '              ',
    '              ',
    '              ',
    '   BBBBBBBB   ',
    '  BWWBBBBWWB  ',
    ' BWWBBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BBBBBBBBBBBB ',
    ' BCBCCCCCCBCB ',
    ' BCCCCPPCCCCB ',
    ' BCCCCCCCCCCB ',
    '  BCCCCCCCCB  ',
    '   BBBBBBBB   ',
    '              ',
  ],
  bird: [
    '              ',
    '      BBB     ',
    '     BWWWB    ',
    '    BWWWWWB   ',
    '   BBBBBBBBB  ',
    '  BWWBBBBWWB  ',
    ' BWWBBBBBBWWB ',
    ' BBBBBBBBBBBB ',
    ' BCBCCCCCCBCB ',
    ' BCCCCCCCCCCB ',
    '  BCCCCCCCCB  ',
    '   BCCCCCCB   ',
    '    BBBBBB    ',
    '              ',
  ],
}

const palettes: Record<string, Record<string, string>> = {
  cat:   { B: '#1a1a2e', W: '#ffffff', C: '#f4a261', L: '#f4d35e', E: '#2a2a4a', P: '#e76f51' },
  dog:   { B: '#1a1a2e', W: '#ffffff', C: '#d4a373', L: '#e9c46a', E: '#2a2a4a', P: '#e76f51' },
  rabbit:{ B: '#1a1a2e', W: '#ffffff', C: '#f8edeb', L: '#fec5bb', E: '#2a2a4a', P: '#e76f51' },
  hamster:{B: '#1a1a2e', W: '#ffffff', C: '#d4a373', L: '#e9c46a', E: '#2a2a4a', P: '#e76f51' },
  bird:  { B: '#1a1a2e', W: '#ffffff', C: '#219ebc', L: '#8ecae6', E: '#2a2a4a', P: '#ffb703' },
}

const canvasStyle = computed(() => {
  const pattern = patterns[props.species] || patterns.cat
  const palette = palettes[props.species] || palettes.cat
  const p = pixel.value

  const shadows: string[] = []
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch !== ' ') {
        const color = palette[ch] || palette.C
        shadows.push(`${x * p}px ${y * p}px 0 ${color}`)
      }
    }
  }

  return {
    width: `${p}px`,
    height: `${p}px`,
    backgroundColor: 'transparent',
    boxShadow: shadows.join(', '),
  }
})
</script>

<style scoped>
.pet-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
}
.pixel-canvas {
  flex-shrink: 0;
}
</style>
