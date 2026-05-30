<template>
  <div class="slide-up">
    <div class="flex items-center gap-4 mb-6">
      <router-link to="/">
        <PxButton type="default">
          <template #icon>
            <PxIcon icon="arrow-left" size="sm" />
          </template>
          返回
        </PxButton>
      </router-link>
      <h1 class="text-2xl font-bold text-white">创建新宠物</h1>
    </div>

    <div class="max-w-lg mx-auto">
      <PxCard>
        <template #header>
          <div class="text-center">
            <img
              v-if="selectedImage"
              :src="selectedImage"
              :alt="species"
              class="w-24 h-24 mx-auto mb-4 float-anim image-pixelated"
            />
            <div v-else class="text-6xl mb-4 float-anim">{{ selected.emoji }}</div>
            <h3 class="text-lg font-bold">选择你的伙伴</h3>
          </div>
        </template>
        <div class="flex flex-col gap-6 text-left">
          <div>
            <label class="block mb-3 text-sm font-medium text-neutral-300">选择种类</label>
            <div class="flex flex-wrap gap-2 justify-center">
              <PxButton
                v-for="s in speciesList"
                :key="s.value"
                :type="species === s.value ? 'primary' : 'default'"
                size="sm"
                @click="species = s.value"
              >
                {{ species === s.value ? '◆ ' : '' }}{{ s.label }}
              </PxButton>
            </div>
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-neutral-300">宠物名字</label>
            <PxInput v-model="name" placeholder="输入名字..." />
          </div>

          <div class="flex gap-4 justify-center">
            <PxButton type="primary" :loading="loading" @click="handleSubmit">
              创建宠物
            </PxButton>
            <router-link to="/">
              <PxButton type="default">取消</PxButton>
            </router-link>
          </div>
        </div>
      </PxCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PxCard, PxButton, PxInput, PxIcon } from 'sakana-element'
import { usePetStore } from '../stores/petStore'
import wholeCat from '../assets/whole_cat.svg'
import wholeDog from '../assets/whole_dog.svg'
import wholeRabbit from '../assets/whole_rabbit.svg'

const router = useRouter()
const { addPet, loading } = usePetStore()
const name = ref('')
const species = ref('cat')

const speciesList = [
  { value: 'cat', label: '猫', emoji: '🐱' },
  { value: 'dog', label: '狗', emoji: '🐶' },
  { value: 'rabbit', label: '兔子', emoji: '🐰' },
  { value: 'hamster', label: '仓鼠', emoji: '🐹' },
  { value: 'bird', label: '鸟', emoji: '🐦' },
]

const speciesImageMap: Record<string, string> = {
  cat: wholeCat,
  dog: wholeDog,
  rabbit: wholeRabbit,
}

const selected = computed(() => speciesList.find(s => s.value === species.value)!)
const selectedImage = computed(() => speciesImageMap[species.value] || '')

async function handleSubmit() {
  if (!name.value.trim()) return
  await addPet(name.value.trim(), species.value)
  router.push('/')
}
</script>
