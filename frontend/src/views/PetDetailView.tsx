import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  PixelButton,
  PixelCard,
  PixelProgress,
  PixelBadge,
  PixelEmptyState,
} from '@pxlkit/ui-kit'
import { PxlKitIcon } from '@pxlkit/core'
import { Undo, Trash } from '@pxlkit/ui'
import PetAvatar from '../components/PetAvatar'
import { api, type Pet, type PetLog, type Activity } from '../api/client'
import { usePetStore } from '../store/petStore'

const speciesMap: Record<string, string> = {
  cat: '猫',
  dog: '狗',
  rabbit: '兔子',
  hamster: '仓鼠',
  bird: '鸟',
}

const speciesToneMap: Record<string, 'pink' | 'gold' | 'purple' | 'red' | 'cyan'> = {
  cat: 'pink',
  dog: 'gold',
  rabbit: 'purple',
  hamster: 'red',
  bird: 'cyan',
}

const statLabels: Record<string, string> = {
  hunger: '饱食度',
  mood: '心情值',
  energy: '精力值',
  cleanliness: '清洁度',
}

const statTones: Record<string, 'green' | 'cyan' | 'gold' | 'purple'> = {
  hunger: 'green',
  mood: 'cyan',
  energy: 'gold',
  cleanliness: 'purple',
}

export default function PetDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activities, fetchActivities, doActivity, removePet, loading } = usePetStore()
  const [pet, setPet] = useState<Pet | null>(null)
  const [logs, setLogs] = useState<PetLog[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPet = useCallback(async () => {
    if (!id) return
    setFetching(true)
    setError(null)
    try {
      const [petData, logsData] = await Promise.all([
        api.getPet(id),
        api.getLogs(id),
      ])
      setPet(petData)
      setLogs(logsData)
    } catch (e: any) {
      setError(e.message || '加载失败')
    } finally {
      setFetching(false)
    }
  }, [id])

  useEffect(() => {
    loadPet()
    if (activities.length === 0) fetchActivities()
  }, [loadPet, fetchActivities, activities.length])

  const handleActivity = async (activityId: number) => {
    if (!id) return
    try {
      await doActivity(id, activityId)
      await loadPet()
    } catch (e: any) {
      setError(e.message || '操作失败')
    }
  }

  const handleDelete = async () => {
    if (!id || !pet) return
    if (!window.confirm(`确定要删除 ${pet.name} 吗？此操作不可撤销。`)) return
    try {
      await removePet(id)
      navigate('/')
    } catch (e: any) {
      setError(e.message || '删除失败')
    }
  }

  if (fetching || (!pet && !error)) {
    return <div className="text-center p-8 text-neutral-400">加载中...</div>
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <PixelEmptyState
          title="宠物不见了"
          description={error || '找不到这只宠物'}
        />
        <Link to="/">
          <PixelButton tone="gold">返回广场</PixelButton>
        </Link>
      </div>
    )
  }

  const speciesLabel = speciesMap[pet.species] || pet.species

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <PixelButton tone="neutral" variant="ghost" iconLeft={<PxlKitIcon icon={Undo} size={18} />}>
            返回
          </PixelButton>
        </Link>
        <h1 className="text-2xl font-bold">{pet.name}</h1>
        <div className="ml-auto">
          <PixelButton tone="red" variant="ghost" iconLeft={<PxlKitIcon icon={Trash} size={18} />} onClick={handleDelete}>
            删除
          </PixelButton>
        </div>
      </div>

      {/* Pet Info Card */}
      <PixelCard
        title={pet.name}
        icon={<PetAvatar species={pet.species} size={32} />}
        className="mb-6"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <PixelBadge tone={speciesToneMap[pet.species] || 'neutral'}>
            {speciesLabel}
          </PixelBadge>
          <PixelBadge tone="purple">Lv.{pet.level}</PixelBadge>
        </div>
      </PixelCard>

      {/* Stats */}
      {pet.stats && (
        <PixelCard title="状态" className="mb-6">
          <div className="flex flex-col gap-4">
            <PixelProgress
              label={statLabels.hunger}
              value={pet.stats.hunger}
              tone={statTones.hunger}
              showValue
            />
            <PixelProgress
              label={statLabels.mood}
              value={pet.stats.mood}
              tone={statTones.mood}
              showValue
            />
            <PixelProgress
              label={statLabels.energy}
              value={pet.stats.energy}
              tone={statTones.energy}
              showValue
            />
            <PixelProgress
              label={statLabels.cleanliness}
              value={pet.stats.cleanliness}
              tone={statTones.cleanliness}
              showValue
            />
          </div>
        </PixelCard>
      )}

      {/* Activities */}
      <PixelCard title="互动" className="mb-6">
        <div className="flex flex-wrap gap-3">
          {activities.map((activity) => (
            <PixelButton
              key={activity.id}
              tone="gold"
              loading={loading}
              onClick={() => handleActivity(activity.id)}
              title={activity.description}
            >
              {activity.name}
            </PixelButton>
          ))}
        </div>
      </PixelCard>

      {/* Logs */}
      <PixelCard title="日志">
        {logs.length === 0 ? (
          <div className="text-sm text-neutral-400">还没有日志</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="text-sm py-2 px-3 border-l-4 border-neutral-600 bg-neutral-800/50"
              >
                <span className="text-neutral-400 text-xs mr-2">
                  {new Date(log.createdAt).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </PixelCard>
    </div>
  )
}
