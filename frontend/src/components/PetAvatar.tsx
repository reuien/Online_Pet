const speciesIconMap: Record<string, string> = {
  cat: '/icons/lion.svg',
  dog: '/icons/dog.svg',
  rabbit: '/icons/rat.svg',
  hamster: '/icons/rat.svg',
  bird: '/icons/chick.svg',
}

interface PetAvatarProps {
  species: string
  size?: number
}

export default function PetAvatar({ species, size = 32 }: PetAvatarProps) {
  const src = speciesIconMap[species] || speciesIconMap.cat
  return (
    <img
      src={src}
      alt={species}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
