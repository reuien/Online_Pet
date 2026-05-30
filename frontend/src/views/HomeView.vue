<template>
  <div class="slide-up">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">宠物广场</h1>
        <p class="text-sm text-neutral-400 mt-1">你有 {{ pets.length }} 只宠物</p>
      </div>
      <router-link to="/create">
        <PxButton type="primary" size="sm">
          <template #icon>
            <PxIcon icon="arrow-right" size="sm" />
          </template>
          新建
        </PxButton>
      </router-link>
    </div>

    <div v-if="loading && pets.length === 0" class="flex flex-col items-center justify-center gap-4 p-12 min-h-[60vh]">
      <div class="text-4xl float-anim">🐾</div>
      <div class="text-neutral-400 text-sm">加载中...</div>
    </div>

    <div v-else-if="pets.length === 0" class="flex flex-col items-center gap-6 p-8 min-h-[60vh] justify-center slide-up">
      <img src="../assets/pixel-house.svg" alt="pixel house" class="w-24 h-24 float-anim image-pixelated" />
      <PxCard>
        <div class="text-center py-8 px-4">
          <h3 class="text-lg font-bold mb-2">还没有宠物</h3>
          <p class="text-sm text-neutral-400">快去创建一只可爱的宠物，开启养成之旅吧！</p>
        </div>
      </PxCard>
      <router-link to="/create">
        <PxButton type="primary">
          <template #icon>
            <PxIcon icon="arrow-right" size="sm" />
          </template>
          创建宠物
        </PxButton>
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <router-link
        v-for="(pet, idx) in pets"
        :key="pet.id"
        :to="`/pet/${pet.id}`"
        class="no-underline block"
      >
        <div class="pixel-card-hover" :style="{ animationDelay: `${idx * 0.1}s` }">
          <PxCard>
            <template #header>
              <div class="flex items-center gap-2">
                <PetAvatar :species="pet.species" :size="28" />
                <span class="font-bold">{{ pet.name }}</span>
              </div>
            </template>
            <div v-if="pet.stats" class="flex flex-col gap-1 mt-1">
              <MiniStat label="饱食" :value="pet.stats.hunger" color="#00FF88" />
              <MiniStat label="心情" :value="pet.stats.mood" color="#4ECDC4" />
              <MiniStat label="精力" :value="pet.stats.energy" color="#FFD700" />
              <MiniStat label="清洁" :value="pet.stats.cleanliness" color="#A855F7" />
              <MiniStat label="健康" :value="pet.stats.health" color="#FF6B6B" />
              <div class="flex items-center justify-between mt-1 pt-1 border-t border-neutral-700/50">
                <span class="text-[10px] text-neutral-500">活动 {{ pet.stats.totalActivities }} 次</span>
                <span class="text-[10px] text-yellow-400">🪙 {{ pet.coins }}</span>
              </div>
            </div>
            <template #footer>
              <div class="flex items-center gap-2 flex-wrap">
                <PxBadge :type="speciesTone(pet.species)">{{ speciesLabel(pet.species) }}</PxBadge>
                <PxBadge type="primary">Lv.{{ pet.level }}</PxBadge>
                <span class="text-lg ml-auto">{{ statusEmoji[pet.status] || '🙂' }}</span>
              </div>
            </template>
          </PxCard>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PxCard, PxBadge, PxButton, PxIcon } from 'sakana-element'
import { usePetStore } from '../stores/petStore'
import PetAvatar from '../components/PetAvatar.vue'
import MiniStat from '../components/MiniStat.vue'

const store = usePetStore()
const { pets, loading } = storeToRefs(store)
const { fetchPets, connectSocket } = store

onMounted(() => {
  connectSocket()
  fetchPets()
})

const speciesMap: Record<string, string> = {
  cat: '猫', dog: '狗', rabbit: '兔子', hamster: '仓鼠', bird: '鸟',
}
const speciesToneMap: Record<string, any> = {
  cat: 'pink', dog: 'gold', rabbit: 'purple', hamster: 'red', bird: 'cyan',
}
const statusEmoji: Record<string, string> = {
  happy: '😄', normal: '🙂', hungry: '😋', tired: '😴', sad: '😢', dirty: '🤢', sick: '🤒',
}

function speciesLabel(s: string) {
  return speciesMap[s] || s
}
function speciesTone(s: string) {
  return speciesToneMap[s] || 'default'
}
</script>
