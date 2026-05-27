import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PixelCard, PixelButton, PixelBadge, PixelEmptyState } from '@pxlkit/ui-kit'
import { PxlKitIcon } from '@pxlkit/core'
import { ArrowRight } from '@pxlkit/ui'
import { usePetStore } from '../store/petStore'
import PetAvatar from '../components/PetAvatar'

const speciesMap: Record<string, string> = {
  cat: '猫', dog: '狗', rabbit: '兔子', hamster: '仓鼠', bird: '鸟',
}

export default function HomeView() {
  const { pets, fetchPets, loading } = usePetStore()

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  if (loading && pets.length === 0) {
    return <div className="text-center p-8">加载中...</div>
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <PixelEmptyState
          title="还没有宠物"
          description="快去创建一只可爱的宠物吧！"
        />
        <Link to="/create">
          <PixelButton tone="gold" iconLeft={<PxlKitIcon icon={ArrowRight} size={20} />}>
            创建宠物
          </PixelButton>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">宠物广场</h1>
        <Link to="/create">
          <PixelButton tone="gold" size="sm" iconLeft={<PxlKitIcon icon={ArrowRight} size={16} />}>
            创建宠物
          </PixelButton>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <Link key={pet.id} to={`/pet/${pet.id}`} className="no-underline">
            <PixelCard
              title={pet.name}
              icon={<PetAvatar species={pet.species} size={28} />}
              footer={
                <div className="flex items-center gap-2">
                  <PixelBadge tone="cyan">{speciesMap[pet.species] || pet.species}</PixelBadge>
                  <PixelBadge tone="purple">Lv.{pet.level}</PixelBadge>
                </div>
              }
            >
              <div className="text-sm text-neutral-400">
                {pet.stats && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <span>饱食 {pet.stats.hunger}</span>
                    <span>心情 {pet.stats.mood}</span>
                    <span>精力 {pet.stats.energy}</span>
                    <span>清洁 {pet.stats.cleanliness}</span>
                  </div>
                )}
              </div>
            </PixelCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
