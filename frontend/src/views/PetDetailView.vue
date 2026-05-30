<template>
  <div class="slide-up">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/">
        <PxButton type="default">
          <template #icon>
            <PxIcon icon="arrow-left" size="sm" />
          </template>
          返回
        </PxButton>
      </router-link>
      <h1 class="text-xl font-bold text-white truncate">{{ pet?.name || '宠物详情' }}</h1>
      <div class="ml-auto">
        <PxPopconfirm
          title="确定要删除这只宠物吗？"
          confirm-button-text="删除"
          cancel-button-text="取消"
          confirm-button-type="danger"
          cancel-button-type="default"
          icon="warning"
          icon-color="#e74c3c"
          placement="bottom-end"
          trigger="click"
          @confirm="handleDelete"
        >
          <template #reference>
            <PxButton type="danger" size="sm">
              <template #icon>
                <PxIcon icon="trash" size="sm" />
              </template>
              删除
            </PxButton>
          </template>
        </PxPopconfirm>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="fetching || (!pet && !error)" class="flex flex-col items-center justify-center gap-4 p-12 min-h-[60vh]">
      <div class="text-4xl float-anim">🐾</div>
      <div class="text-neutral-400 text-sm">加载中...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error || !pet" class="flex flex-col items-center gap-6 p-8 min-h-[60vh] justify-center">
      <div class="text-6xl">😿</div>
      <PxCard>
        <div class="text-center py-8 px-4">
          <h3 class="text-lg font-bold mb-2">宠物不见了</h3>
          <p class="text-sm text-neutral-400">{{ error || '找不到这只宠物' }}</p>
        </div>
      </PxCard>
      <router-link to="/">
        <PxButton type="primary">返回广场</PxButton>
      </router-link>
    </div>

    <!-- Pet Detail Content -->
    <template v-else>
      <!-- Pet Profile Card -->
      <div class="relative mb-6">
        <div class="absolute inset-0 opacity-20 rounded-sm" :style="{ backgroundColor: statusColor }" />
        <PxCard>
          <template #header>
            <div class="flex items-center gap-4 relative">
              <div class="float-anim"><PetAvatar :species="pet.species" :size="48" /></div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span class="text-xl font-bold text-white">{{ pet.name }}</span>
                  <PxBadge :type="speciesToneMap[pet.species] || 'default'">{{ speciesLabel }}</PxBadge>
                </div>
                <div class="flex items-center gap-3 flex-wrap text-sm">
                  <span class="text-yellow-400">🪙 {{ pet.coins }}</span>
                  <span class="text-purple-400">Lv.{{ pet.level }}</span>
                  <PxTooltip :content="status.desc">
                    <span class="cursor-help" :style="{ color: statusColor }">
                      {{ status.emoji }} {{ status.label }}
                    </span>
                  </PxTooltip>
                </div>
                <!-- Experience bar -->
                <div class="mt-3">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="text-neutral-400">经验值</span>
                    <span class="text-neutral-400">{{ pet.experience }} / {{ expNeeded }} ({{ expPercent }}%)</span>
                  </div>
                  <div class="h-2 bg-[#2a2a4a] overflow-hidden">
                    <div class="h-full bg-yellow-500 transition-all duration-500" :style="{ width: expPercent + '%' }" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </PxCard>
      </div>

      <!-- Stats -->
      <PxCard v-if="pet.stats" class="mb-6">
        <template #header>
          <span class="font-bold">状态</span>
        </template>
        <div class="flex flex-col gap-3">
          <div
            v-for="s in statConfig"
            :key="s.key"
            class="flex items-center gap-2"
          >
            <span class="text-xs text-neutral-400 w-12">{{ s.label }}</span>
            <PxProgress
              class="flex-1"
              :percentage="(pet.stats as any)[s.key]"
              :type="s.type"
              show-text
            />
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-neutral-700/50 flex items-center justify-between text-xs text-neutral-500">
          <span>总活动次数: {{ pet.stats.totalActivities }}</span>
          <span>上次更新: {{ formatTime(pet.stats.lastUpdated) }}</span>
        </div>
      </PxCard>

      <!-- Activities -->
      <PxCard class="mb-6">
        <template #header>
          <span class="font-bold">互动</span>
        </template>
        <div v-if="lastAction" class="mb-3 text-sm text-green-400 text-center animate-pulse">
          ✦ {{ pet.name }} 刚刚{{ lastAction }}了！
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="activity in activities"
            :key="activity.id"
            @click="handleActivity(activity.id, activity.name)"
            :disabled="acting"
            class="cursor-pointer bg-transparent border-0 p-0 text-left"
          >
            <div class="p-3 rounded-sm border-2 border-[#3a3a5a] bg-[#252545]
                        hover:border-yellow-500/50 hover:bg-[#2a2a50]
                        active:translate-y-px transition-all duration-150"
                 :class="{ 'opacity-50': acting }"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{{ activityIconMap[activity.icon] || '✨' }}</span>
                <span class="text-sm font-medium text-white">{{ activity.name }}</span>
              </div>
              <div class="text-[10px] text-neutral-400 leading-tight">{{ activity.description }}</div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-[10px] text-yellow-400">+{{ activity.expReward }} EXP</span>
                <span v-if="activity.coinReward > 0" class="text-[10px] text-yellow-300">+{{ activity.coinReward }} 🪙</span>
              </div>
            </div>
          </button>
        </div>
      </PxCard>

      <!-- Logs -->
      <PxCard>
        <template #header>
          <span class="font-bold">日志</span>
        </template>
        <div v-if="logs.length === 0" class="text-sm text-neutral-400 text-center py-6">
          还没有日志
        </div>
        <div v-else class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm py-2 px-3 border-l-4 border-[#4a4a6a] bg-[#252545]/60"
          >
            <span class="text-neutral-500 text-xs mr-2">{{ formatDate(log.createdAt) }}</span>
            <span class="text-neutral-200">{{ log.message }}</span>
          </div>
        </div>
      </PxCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PxCard, PxButton, PxBadge, PxProgress, PxTooltip, PxIcon, PxPopconfirm } from 'sakana-element'
import PetAvatar from '../components/PetAvatar.vue'
import { api, type Pet, type PetLog, type Activity } from '../api/client'
import { petSocket } from '../api/socket'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const pet = ref<Pet | null>(null)
const logs = ref<PetLog[]>([])
const activities = ref<Activity[]>([])
const fetching = ref(false)
const acting = ref(false)
const error = ref<string | null>(null)
const lastAction = ref<string | null>(null)

const speciesMap: Record<string, string> = {
  cat: '猫', dog: '狗', rabbit: '兔子', hamster: '仓鼠', bird: '鸟',
}
const speciesEmoji: Record<string, string> = {
  cat: '🐱', dog: '🐶', rabbit: '🐰', hamster: '🐹', bird: '🐦',
}
const speciesToneMap: Record<string, any> = {
  cat: 'pink', dog: 'gold', rabbit: 'purple', hamster: 'red', bird: 'cyan',
}
const statusInfo: Record<string, { emoji: string; label: string; desc: string }> = {
  happy: { emoji: '😄', label: '开心', desc: '宠物心情很好！' },
  normal: { emoji: '🙂', label: '正常', desc: '一切正常' },
  hungry: { emoji: '😋', label: '饥饿', desc: '宠物饿了，快喂食！' },
  tired: { emoji: '😴', label: '疲倦', desc: '宠物累了，需要休息' },
  sad: { emoji: '😢', label: '难过', desc: '宠物心情不好，陪它玩玩' },
  dirty: { emoji: '🤢', label: '脏兮兮', desc: '宠物需要洗澡了' },
  sick: { emoji: '🤒', label: '生病', desc: '宠物生病了，快带它看病！' },
}
const activityIconMap: Record<string, string> = {
  food: '🍖', play: '🎾', bath: '🛁', sleep: '🛏️',
  train: '💪', walk: '🚶', heal: '💊', photo: '📷',
}
const statConfig = [
  { key: 'hunger', label: '饱食度', type: 'success' as const },
  { key: 'mood', label: '心情值', type: 'info' as const },
  { key: 'energy', label: '精力值', type: 'warning' as const },
  { key: 'cleanliness', label: '清洁度', type: 'primary' as const },
  { key: 'health', label: '健康值', type: 'danger' as const },
]

function expForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1))
}

const speciesLabel = computed(() => pet.value ? (speciesMap[pet.value.species] || pet.value.species) : '')
const status = computed(() => pet.value ? (statusInfo[pet.value.status] || statusInfo.normal) : statusInfo.normal)
const expNeeded = computed(() => pet.value ? expForLevel(pet.value.level) : 100)
const expPercent = computed(() => pet.value ? Math.min(100, Math.round((pet.value.experience / expNeeded.value) * 100)) : 0)
const statusColor = computed(() => {
  if (!pet.value) return '#fbbf24'
  return pet.value.status === 'sick' ? '#f87171' : pet.value.status === 'happy' ? '#00FF88' : '#fbbf24'
})

async function loadPet() {
  if (!id.value) return
  fetching.value = true
  error.value = null
  try {
    const [petData, logsData, actsData] = await Promise.all([
      api.getPet(id.value),
      api.getLogs(id.value),
      api.getActivities(),
    ])
    pet.value = petData
    logs.value = logsData
    activities.value = actsData
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    fetching.value = false
  }
}

async function handleActivity(activityId: number, activityName: string) {
  if (!id.value || acting.value) return
  acting.value = true
  lastAction.value = activityName
  try {
    await api.doActivity(id.value, activityId)
    await loadPet()
  } catch (e: any) {
    error.value = e.message || '操作失败'
  } finally {
    setTimeout(() => { acting.value = false }, 300)
  }
}

async function handleDelete() {
  if (!id.value || !pet.value) return
  try {
    await api.deletePet(id.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || '删除失败'
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('zh-CN')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

onMounted(() => {
  loadPet()

  // Connect WebSocket and subscribe to this pet's real-time updates
  petSocket.connect()
  petSocket.subscribe(id.value)
  petSocket.onPetUpdate((data: Pet) => {
    if (data.id === id.value) {
      pet.value = data
    }
  })
})

onUnmounted(() => {
  petSocket.unsubscribe(id.value)
})
</script>
