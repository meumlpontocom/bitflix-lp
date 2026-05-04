/**
 * Descoberta inicial de repositorios para o catalogo open source.
 *
 * Uso:
 *   CATALOG_SOURCE_URL=https://githubawesome.com/github-trending-weekly-30/ pnpm catalog:import
 *
 * Este script registra a execucao e imprime os repos encontrados. Ele nao copia
 * HTML da fonte e nao cria posts automaticamente; a geracao editorial completa
 * continua sendo revisada antes de publicar.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

interface Args {
  source?: string
  sourceName: string
  requestedBy: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    source: process.env.CATALOG_SOURCE_URL,
    sourceName: process.env.CATALOG_SOURCE_NAME || 'Github Awesome',
    requestedBy: process.env.CATALOG_REQUESTED_BY || 'Codex',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    if (arg === '--source' && next) {
      args.source = next
      i += 1
    } else if (arg === '--source-name' && next) {
      args.sourceName = next
      i += 1
    } else if (arg === '--requested-by' && next) {
      args.requestedBy = next
      i += 1
    }
  }

  return args
}

function normalizeGithubRepoUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return null

    const [owner, repo] = url.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => part.trim())

    if (!owner || !repo) return null
    if (
      [
        'apps',
        'collections',
        'enterprise',
        'features',
        'marketplace',
        'orgs',
        'resources',
        'security',
        'solutions',
        'sponsors',
        'topics',
        'trending',
      ].includes(owner)
    ) {
      return null
    }

    const cleanRepo = repo.replace(/\.git$/, '')
    return `https://github.com/${owner}/${cleanRepo}`
  } catch {
    return null
  }
}

function extractGithubRepos(html: string): string[] {
  const absoluteMatches = html.match(
    /https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g,
  )
  const relativeMatches = [...html.matchAll(/href="\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)"/g)]
  const repos = new Set<string>()

  for (const match of absoluteMatches ?? []) {
    const normalized = normalizeGithubRepoUrl(match)
    if (normalized) repos.add(normalized)
  }
  for (const match of relativeMatches) {
    const normalized = normalizeGithubRepoUrl(`https://github.com/${match[1]}/${match[2]}`)
    if (normalized) repos.add(normalized)
  }

  return [...repos].sort()
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.source) {
    throw new Error('Informe --source <url>')
  }

  const sourceUrl = new URL(args.source).toString()
  const startedAt = new Date().toISOString()
  const payload = await getPayload({ config })

  const response = await fetch(sourceUrl, {
    headers: {
      'user-agent': 'BitflixCatalogImporter/1.0 (+https://bitflix.com.br)',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  const html = await response.text()
  const repos = response.ok ? extractGithubRepos(html) : []
  const finishedAt = new Date().toISOString()

  console.log(`Fonte: ${sourceUrl}`)
  console.log(`Repositorios encontrados: ${repos.length}`)

  const importRecord = await payload.create({
    collection: 'open-source-catalog-imports',
    data: {
      source_url: sourceUrl,
      source_name: args.sourceName,
      requested_by: args.requestedBy,
      status: response.ok ? 'partial' : 'failed',
      repos_found_count: repos.length,
      repos_imported_count: 0,
      repos_skipped_count: 0,
      started_at: startedAt,
      finished_at: finishedAt,
      notes:
        'Descoberta inicial: repositorios extraidos e impressos no console. Posts e entradas do catalogo devem ser criados apos curadoria editorial.',
      errors: response.ok
        ? []
        : [
            {
              message: `Falha ao buscar fonte: HTTP ${response.status}`,
              occurred_at: finishedAt,
            },
          ],
    },
  })

  console.log(`Import registrado no Payload: ${importRecord.id}`)
  for (const repo of repos) {
    console.log(repo)
  }
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
