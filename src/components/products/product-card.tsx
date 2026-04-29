import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProductVM } from '@/dto/product'
import { statusLabel } from '@/dto/product'
import { RenderLexical } from '@/components/lexical/render-lexical'

interface Props {
  product: ProductVM
  showDescription?: boolean
}

export function ProductCard({ product, showDescription = false }: Props) {
  return (
    <Link
      href={product.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-bitflix-900 text-lg">{product.name}</p>
          <p className="font-mono text-bitflix-text/55 text-xs">{product.domain}</p>
        </div>
        <ArrowUpRight className="size-5 text-bitflix-text/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bitflix-700" />
      </div>

      {product.tagline ? (
        <p className="text-sm leading-relaxed text-bitflix-text/80">{product.tagline}</p>
      ) : null}

      {showDescription && product.descriptionLexical ? (
        <div className="prose prose-sm max-w-none text-bitflix-text/75">
          <RenderLexical data={product.descriptionLexical} />
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-2">
        <Badge variant="outline" className="border-bitflix-500/40 text-bitflix-700">
          {statusLabel(product.status)}
        </Badge>
      </div>
    </Link>
  )
}
