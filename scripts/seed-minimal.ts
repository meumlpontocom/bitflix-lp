/**
 * Seed minimo idempotente. Roda via:
 *   pnpm exec payload run scripts/seed-minimal.ts
 *
 * Cria:
 *   - Author 'milton-bastos' (placeholder bio)
 *   - 4 Products (meuml, postflix, marketflix, kronikor)
 *   - SiteSettings global (placeholders editaveis no admin)
 *   - Navigation global (menu basico)
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

type AuthorSeed = {
  name: string
  slug: string
  bio: string
  email?: string
}

type ProductSeed = {
  name: string
  slug: string
  tagline: string
  domain: string
  status: 'producao' | 'recem-lancado' | 'em-desenvolvimento'
  featured: boolean
  display_order: number
}

const AUTHOR: AuthorSeed = {
  name: 'Milton Bastos',
  slug: 'milton-bastos',
  bio: '[Placeholder] Fundador da Bitflix. Atualizar no admin com bio definitiva (3-4 linhas).',
  email: 'miltonbastos@gmail.com',
}

const PRODUCTS: ProductSeed[] = [
  {
    name: 'meuml',
    slug: 'meuml',
    tagline: 'Plataforma para professores de musica gerenciarem alunos, aulas e financeiro.',
    domain: 'meuml.com',
    status: 'producao',
    featured: true,
    display_order: 1,
  },
  {
    name: 'postflix',
    slug: 'postflix',
    tagline: 'Geracao e distribuicao de conteudo para redes sociais com IA.',
    domain: 'postflix.ai',
    status: 'producao',
    featured: true,
    display_order: 2,
  },
  {
    name: 'marketflix',
    slug: 'marketflix',
    tagline: 'Marketing automation com IA embarcada para PMEs.',
    domain: 'marketflix.ai',
    status: 'recem-lancado',
    featured: true,
    display_order: 3,
  },
  {
    name: 'kronikor',
    slug: 'kronikor',
    tagline: 'Em desenvolvimento. Atualizar tagline no admin quando lancado.',
    domain: 'kronikor.com',
    status: 'em-desenvolvimento',
    featured: true,
    display_order: 4,
  },
]

const NAV_MAIN = [
  { label: 'Produtos', href: '/produtos', external: false },
  { label: 'Servicos', href: '/servicos', external: false },
  { label: 'Blog', href: '/blog', external: false },
  { label: 'Sobre', href: '/sobre', external: false },
  { label: 'Contato', href: '/contato', external: false },
]

const NAV_FOOTER = [
  { label: 'Produtos', href: '/produtos', external: false },
  { label: 'Blog', href: '/blog', external: false },
  { label: 'RSS', href: '/blog/feed.xml', external: false },
  { label: 'Sobre', href: '/sobre', external: false },
]

async function seed() {
  const payload = await getPayload({ config })

  // ---------- Author ----------
  const existingAuthors = await payload.find({
    collection: 'authors',
    where: { slug: { equals: AUTHOR.slug } },
    limit: 1,
  })

  if (existingAuthors.totalDocs === 0) {
    await payload.create({
      collection: 'authors',
      data: {
        name: AUTHOR.name,
        slug: AUTHOR.slug,
        bio: AUTHOR.bio,
        email: AUTHOR.email,
      },
    })
    payload.logger.info(`✓ Author criado: ${AUTHOR.slug}`)
  } else {
    payload.logger.info(`= Author ja existe: ${AUTHOR.slug}`)
  }

  // ---------- Products ----------
  for (const p of PRODUCTS) {
    const exists = await payload.find({
      collection: 'products',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })

    if (exists.totalDocs === 0) {
      await payload.create({
        collection: 'products',
        data: {
          name: p.name,
          slug: p.slug,
          tagline: p.tagline,
          domain: p.domain,
          cta_url: `https://${p.domain}`,
          status: p.status,
          featured: p.featured,
          display_order: p.display_order,
          is_active: true,
        },
      })
      payload.logger.info(`✓ Product criado: ${p.slug}`)
    } else {
      payload.logger.info(`= Product ja existe: ${p.slug}`)
    }
  }

  // ---------- SiteSettings (global) ----------
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      whatsapp_number: '',
      whatsapp_messages: {
        default:
          '[Placeholder] Ola! Vim do site bitflix.com.br e gostaria de saber mais sobre os servicos.',
        from_saas_card: '[Placeholder] Ola! Tenho interesse em conhecer melhor o ${product}.',
        from_custom_cta:
          '[Placeholder] Ola! Tenho um projeto sob demanda e quero conversar com a Bitflix.',
        from_blog_footer: '[Placeholder] Ola! Vi um artigo no blog e gostaria de conversar.',
      },
      email_institutional: '',
      umami_website_id: '',
      migration_strategy:
        '[Placeholder] Definir cutover apex DNS quando proximo do go-live producao.',
    },
  })
  payload.logger.info('✓ SiteSettings inicializado com placeholders')

  // ---------- Navigation (global) ----------
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      main_menu: NAV_MAIN,
      footer_links: NAV_FOOTER,
    },
  })
  payload.logger.info('✓ Navigation inicializado')

  payload.logger.info('Seed concluido.')
}

await seed()
process.exit(0)
