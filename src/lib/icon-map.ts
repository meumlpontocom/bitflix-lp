import {
  Cpu,
  Layers,
  Rocket,
  FlaskConical,
  Network,
  Cog,
  Shield,
  Zap,
  Sparkles,
  Code2,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '@/dto/pages'

const ICONS: Record<IconName, LucideIcon> = {
  Cpu,
  Layers,
  Rocket,
  FlaskConical,
  Network,
  Cog,
  Shield,
  Zap,
  Sparkles,
  Code2,
}

export function getIcon(name: IconName): LucideIcon {
  return ICONS[name] ?? Sparkles
}
