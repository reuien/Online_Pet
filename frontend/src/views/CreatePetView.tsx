import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PixelButton, PixelInput, PixelCard, PixelBadge } from '@pxlkit/ui-kit'
import { PxlKitIcon } from '@pxlkit/core'
import { Undo } from '@pxlkit/ui'
import { usePetStore } from '../store/petStore'

const speciesList = [
  { value: 'cat', label: '猫', tone: 'pink' as const },
  { value: 'dog', label: '狗', tone: 'gold' as const },
  { value: 'rabbit', label: '兔子', tone: 'purple' as const },
  { value: 'hamster', label: '仓鼠', tone: 'red' as const },
  { value: 'bird', label: '鸟', tone: 'cyan' as const },
]

export default function CreatePetView() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('cat')
  const navigate = useNavigate()
  const { addPet, loading } = usePetStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await addPet(name.trim(), species)
    navigate('/')
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <PixelButton tone="neutral" variant="ghost" iconLeft={<PxlKitIcon icon={Undo} size={18} />}>
            返回
          </PixelButton>
        </Link>
        <h1 className="text-2xl font-bold">创建新宠物</h1>
      </div>

      <PixelCard title="选择你的伙伴">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium">选择种类</label>
            <div className="flex flex-wrap gap-2">
              {speciesList.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSpecies(s.value)}
                  className="cursor-pointer bg-transparent border-0 p-0"
                >
                  <PixelBadge tone={s.tone}>
                    {species === s.value ? '◆ ' : ''}{s.label}
                  </PixelBadge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">宠物名字</label>
            <PixelInput
              placeholder="输入名字..."
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <PixelButton type="submit" tone="gold" loading={loading}>
              创建宠物
            </PixelButton>
            <Link to="/">
              <PixelButton tone="neutral" variant="ghost">
                取消
              </PixelButton>
            </Link>
          </div>
        </form>
      </PixelCard>
    </div>
  )
}
