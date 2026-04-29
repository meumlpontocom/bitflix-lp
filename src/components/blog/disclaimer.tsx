import { DISCLAIMER_TEXT, type DisclaimerVariant } from '@/dto/article'

interface Props {
  variant: DisclaimerVariant
}

export function ArticleDisclaimer({ variant }: Props) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3 text-bitflix-text/65 text-xs italic">
      {DISCLAIMER_TEXT[variant]}
    </p>
  )
}
