const API_BASE = '/api'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getOwnerId(): string {
  let id = localStorage.getItem('owner_id')
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    id = generateUUID()
    localStorage.setItem('owner_id', id)
  }
  return id
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-ID': getOwnerId(),
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `HTTP ${res.status}`
    try {
      const j = JSON.parse(text)
      msg = j.message || j.error || text || msg
    } catch {
      msg = text || msg
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export interface PetStats {
  hunger: number
  mood: number
  energy: number
  cleanliness: number
  health: number
  totalActivities: number
  lastUpdated: string
}

export interface Pet {
  id: string
  name: string
  species: string
  level: number
  experience: number
  coins: number
  status: string
  stats?: PetStats
}

export interface PetLog {
  id: number
  petId: string
  activityId?: number
  locationId?: number
  message: string
  createdAt: string
}

export interface Activity {
  id: number
  name: string
  description: string
  icon: string
  expReward: number
  coinReward: number
  hungerChange: number
  moodChange: number
  energyChange: number
  cleanlinessChange: number
  healthChange: number
  locationId?: number
}

export const api = {
  getPets: () => request<Pet[]>('/pets'),
  getPet: (id: string) => request<Pet>(`/pets/${id}`),
  createPet: (name: string, species: string) =>
    request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify({ name, species }),
    }),
  deletePet: (id: string) =>
    request<void>(`/pets/${id}`, { method: 'DELETE' }),
  doActivity: (petId: string, activityId: number) =>
    request<Pet>(`/pets/${petId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ activityId }),
    }),
  getLogs: (petId: string) => request<PetLog[]>(`/pet-logs/${petId}`),
  getActivities: () => request<Activity[]>('/activities'),
  getLeaderboard: () => request<Pet[]>('/pets/leaderboard/all'),
}
