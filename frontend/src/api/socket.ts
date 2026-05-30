import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000/pet'

function getOwnerId(): string | null {
  return localStorage.getItem('owner_id')
}

class PetSocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    if (this.socket?.connected) return

    const ownerId = getOwnerId()
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      query: ownerId ? { ownerId } : undefined,
    })

    this.socket.on('connect', () => {
      console.log('[WS] Connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason)
    })

    this.socket.on('connect_error', (err) => {
      this.reconnectAttempts++
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.warn(`[WS] Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, err.message)
      }
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  subscribe(petId: string) {
    this.socket?.emit('subscribe', petId)
  }

  unsubscribe(petId: string) {
    this.socket?.emit('unsubscribe', petId)
  }

  onPetUpdate(callback: (data: any) => void) {
    const wrapped = (data: any) => {
      console.log('[WS] Received petUpdate:', data.id, data.status)
      callback(data)
    }
    // Store wrapped callback so offPetUpdate can match it
    ;(callback as any).__wrapped = wrapped
    this.socket?.on('petUpdate', wrapped)
  }

  offPetUpdate(callback: (data: any) => void) {
    this.socket?.off('petUpdate', callback)
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const petSocket = new PetSocketClient()
