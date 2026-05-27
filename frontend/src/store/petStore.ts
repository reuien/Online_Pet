import { create } from 'zustand'
import { api, type Pet, type Activity, type PetLog } from '../api/client'

interface PetStore {
  pets: Pet[]
  activities: Activity[]
  loading: boolean
  error: string | null
  fetchPets: () => Promise<void>
  fetchActivities: () => Promise<void>
  addPet: (name: string, species: string) => Promise<void>
  removePet: (id: string) => Promise<void>
  doActivity: (petId: string, activityId: number) => Promise<void>
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  activities: [],
  loading: false,
  error: null,

  fetchPets: async () => {
    set({ loading: true, error: null })
    try {
      const pets = await api.getPets()
      set({ pets, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchActivities: async () => {
    try {
      const activities = await api.getActivities()
      set({ activities })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  addPet: async (name, species) => {
    set({ loading: true, error: null })
    try {
      await api.createPet({ name, species })
      await get().fetchPets()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  removePet: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.deletePet(id)
      await get().fetchPets()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  doActivity: async (petId, activityId) => {
    set({ loading: true, error: null })
    try {
      await api.doActivity(petId, activityId)
      await get().fetchPets()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
}))
