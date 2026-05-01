// components/avatar.tsx

interface AvatarProps {
  url: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { px: 28, textClass: 'text-xs' },
  md: { px: 36, textClass: 'text-sm' },
  lg: { px: 56, textClass: 'text-lg' },
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  )
}

export function Avatar({ url, name, size = 'md' }: AvatarProps) {
  const { px, textClass } = sizeConfig[size]

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px, minWidth: px }}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${textClass}`}
      style={{
        width: px,
        height: px,
        minWidth: px,
        backgroundColor: '#7c3aed',
      }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
