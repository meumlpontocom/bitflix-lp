/**
 * Publica em massa o batch "Curadoria Bitflix — Claude skills & agent tooling maio/2026".
 *
 * Faz:
 *   - find OpenSourceCatalogImport por source_name
 *   - find todas OpenSourceCatalogEntry com discovery_batch_id desse import
 *   - para cada entry: update Article (status=published, published_at=now se vazio) + update Entry (catalog_status=published)
 *
 * Sem revalidatePath porque (site)/* tem dynamic='force-dynamic' (per memoria feedback_site_pages_dynamic).
 *
 * Uso:
 *   pnpm exec payload run scripts/publish-batch-claude-skills.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import type { Article, OpenSourceCatalogEntry } from '../src/payload-types.ts'

const SOURCE_NAME = 'Curadoria Bitflix — Claude skills & agent tooling maio/2026'

async function main() {
  const payload = await getPayload({ config })

  const imports = await payload.find({
    collection: 'open-source-catalog-imports',
    where: { source_name: { equals: SOURCE_NAME } },
    limit: 1,
  })

  const importDoc = imports.docs[0]
  if (!importDoc) {
    console.error(`Import record nao encontrado para source_name: ${SOURCE_NAME}`)
    process.exit(1)
  }

  console.log(`Import record id=${importDoc.id}, status=${importDoc.status}, repos=${importDoc.repos_imported_count}`)

  const entries = await payload.find({
    collection: 'open-source-catalog-entries',
    where: { discovery_batch_id: { equals: importDoc.id } },
    limit: 200,
    depth: 0,
  })

  console.log(`Entries encontradas: ${entries.totalDocs}`)

  const results: Array<{ rank: number; name: string; slug: string; articleSlug: string; status: string }> = []
  const now = new Date().toISOString()
  let rank = 0

  for (const entry of entries.docs as OpenSourceCatalogEntry[]) {
    rank += 1
    const articleId = typeof entry.article === 'number' ? entry.article : entry.article?.id
    if (!articleId) {
      console.warn(`Entry ${entry.slug} sem article relacionado — pulando`)
      continue
    }

    const article = (await payload.findByID({
      collection: 'articles',
      id: articleId,
      depth: 0,
    })) as Article

    const publishedAt = article.published_at ?? now

    await payload.update({
      collection: 'articles',
      id: articleId,
      data: {
        status: 'published',
        published_at: publishedAt,
      } as never,
    })

    await payload.update({
      collection: 'open-source-catalog-entries',
      id: entry.id,
      data: {
        catalog_status: 'published',
      } as never,
    })

    results.push({
      rank,
      name: entry.title,
      slug: entry.slug ?? '',
      articleSlug: article.slug ?? '',
      status: 'published',
    })

    console.log(`✓ ${rank}. ${entry.title} -> /blog/${article.slug} (published)`)
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        importId: importDoc.id,
        sourceName: SOURCE_NAME,
        total: results.length,
        results,
      },
      null,
      2,
    ),
  )
}

await main()
