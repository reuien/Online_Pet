<template>
  <div class="slide-up">
    <div class="flex items-center gap-3 mb-6">
      <div class="text-3xl">🏆</div>
      <div>
        <h1 class="text-2xl font-bold text-white">排行榜</h1>
        <p class="text-sm text-neutral-400">全服最强宠物 TOP 10</p>
      </div>
    </div>

    <div v-if="leaderboard.length === 0" class="flex flex-col items-center gap-6 p-8 min-h-[60vh] justify-center">
      <div class="text-6xl float-anim">🏆</div>
      <PxCard>
        <div class="text-center py-8 px-4">
          <h3 class="text-lg font-bold mb-2">排行榜为空</h3>
          <p class="text-sm text-neutral-400">还没有宠物上榜，快去创建宠物吧！</p>
        </div>
      </PxCard>
      <router-link to="/create">
        <PxButton type="primary">创建宠物</PxButton>
      </router-link>
    </div>

    <div v-else class="flex flex-col gap-3">
      <router-link
        v-for="(pet, idx) in leaderboard"
        :key="pet.id"
        :to="`/pet/${pet.id}`"
        class="no-underline block"
      >
        <div class="pixel-card-hover">
          <PxCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="text-2xl min-w-[32px] text-center">
                  <span v-if="idx < 3">{{ rankMedal[idx] }}</span>
                  <span v-else class="text-neutral-500 text-sm">{{ idx + 1 }}</span>
                </div>
                <PetAvatar :species="pet.species" :size="24" />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">{{ pet.name }}</span>
                    <PxBadge :type="speciesToneMap[pet.species] || 'default'" size="sm">
                      {{ speciesMap[pet.species] || pet.species }}
                    </PxBadge>
                  </div>
                  <div class="text-xs text-neutral-400 mt-0.5">
                    经验值 {{ pet.experience }} EXP
                  </div>
                </div>
              </div>
            </template>
            <div class="flex items-center gap-3 text-xs">
              <span class="text-yellow-400">🪙 {{ pet.coins }}</span>
              <span class="text-purple-400">Lv.{{ pet.level }}</span>
              <span v-if="pet.stats" class="text-neutral-500">
                活动 {{ pet.stats.totalActivities }} 次
              </span>
            </div>
          </PxCard>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PxCard, PxBadge, PxButton } from 'sakana-element'
import { usePetStore } from '../stores/petStore'
import PetAvatar from '../components/PetAvatar.vue'

const store = usePetStore()
const { leaderboard } = storeToRefs(store)
const { fetchLeaderboard } = store

onMounted(() => {
  fetchLeaderboard()
})

const rankMedal = ['🥇', '🥈', '🥉']
const speciesMap: Record<string, string> = {
  cat: '猫', dog: '狗', rabbit: '兔子', hamster: '仓鼠', bird: '鸟',
}
const speciesToneMap: Record<string, any> = {
  cat: 'pink', dog: 'gold', rabbit: 'purple', hamster: 'red', bird: 'cyan',
}
</script>