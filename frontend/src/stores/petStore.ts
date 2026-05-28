import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, type Pet, type Activity } from '../api/client'

export const usePetStore = defineStore('pet', () => {
  const pets = ref<Pet[]>([])
  const leaderboard = ref<Pet[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPets() {
    loading.value = true
    error.value = null
    try {
      pets.value = await api.getPets()
    } catch (e: any) {
      error.value = e.message || '获取宠物失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchLeaderboard() {
    try {
      leaderboard.value = await api.getLeaderboard()
    } catch (e: any) {
      error.value = e.message || '获取排行榜失败'
    }
  }

  async function addPet(name: string, species: string) {
    loading.value = true
    try {
      await api.createPet(name, species)
      await fetchPets()
    } catch (e: any) {
      error.value = e.message || '创建失败'
    } finally {
      loading.value = false
    }
  }

  async function removePet(id: string) {
    try {
      await api.deletePet(id)
      pets.value = pets.value.filter((p) => p.id !== id)
    } catch (e: any) {
      error.value = e.message || '删除失败'
    }
  }

  async function doActivity(petId: string, activityId: number) {
    try {
      await api.doActivity(petId, activityId)
    } catch (e: any) {
      error.value = e.message || '操作失败'
      throw e
    }
  }

  return {
    pets,
    leaderboard,
    loading,
    error,
    fetchPets,
    fetchLeaderboard,
    addPet,
    removePet,
    doActivity,
  }
})
