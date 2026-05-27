function getOwnerId(): string {
  let id = localStorage.getItem('owner_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('owner_id', id)
  }
  return id
}

const API_BASE = '/api'

export interface Pet {
  id: string
  ownerId: string
  name: string
  species: string
  level: number
  createdAt: string
  stats?: PetStats
}

export interface PetStats {
  petId: string
  hunger: number
  mood: number
  energy: number
  cleanliness: number
  lastUpdated: string
}

export interface PetLog {
  id: string
  petId: string
  activityId?: number
  message: string
  createdAt: string
}

export interface Activity {
  id: number
  name: string
  description: string
  hungerChange: number
  moodChange: number
  energyChange: number
  cleanlinessChange: number
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Owner-ID': getOwnerId(),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getPets: () => request<Pet[]>('/pets'),
  getPet: (id: string) => request<Pet>(`/pets/${id}`),
  createPet: (data: { name: string; species: string }) =>
    request<Pet>('/pets', { method: 'POST', body: JSON.stringify(data) }),
  deletePet: (id: string) =>
    request<void>(`/pets/${id}`, { method: 'DELETE' }),
  doActivity: (petId: string, activityId: number) =>
    request<{ pet: Pet; log: PetLog }>(`/pets/${petId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ activityId }),
    }),
  getLogs: (petId: string) => request<PetLog[]>(`/pet-logs/${petId}`),
  getActivities: () => request<Activity[]>('/activities'),
}
