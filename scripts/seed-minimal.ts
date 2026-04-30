/**
 * Seed minimo idempotente. Roda via:
 *   pnpm exec payload run scripts/seed-minimal.ts
 *
 * Cria:
 *   - Author 'milton-bastos' (placeholder bio)
 *   - 4 Products (meuml, postflix, marketflix, kronikor)
 *   - SiteSettings global (placeholders editaveis no admin)
 *   - Navigation global (menu basico)
 *   - HomePage / ProdutosPage / ServicosPage / SobrePage / ContatoPage globals
 *     populados com o conteudo editorial atual (idempotente: so seeda se vazio).
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

  // ---------- Page globals (idempotente — so seeda se nao foi populado ainda) ----------
  await seedHomePage(payload)
  await seedProdutosPage(payload)
  await seedServicosPage(payload)
  await seedSobrePage(payload)
  await seedContatoPage(payload)

  payload.logger.info('Seed concluido.')
}

type AnyPayload = Awaited<ReturnType<typeof getPayload>>

async function seedHomePage(payload: AnyPayload) {
  const existing = await payload.findGlobal({ slug: 'home-page', depth: 0 })
  if ((existing as { hero_title_prefix?: string }).hero_title_prefix) {
    payload.logger.info('= HomePage ja populada')
    return
  }
  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero_title_prefix: 'Software com IA',
      hero_title_highlight: 'embarcada',
      hero_title_suffix: 'no cliente final.',
      hero_cta_primary_label: 'Conhecer produtos',
      hero_cta_secondary_label: 'Projeto sob demanda',
      pillars_section_title: 'IA não como ferramenta interna — como entrega.',
      pillars_section_body:
        'Construímos produtos onde o cliente final usa IA diretamente. Não é só Copilot no nosso IDE: é IA viva no software que vai pra produção.',
      pillars: [
        {
          icon: 'Cpu',
          title: 'IA no produto, não no processo',
          body: 'Cada SaaS Bitflix entrega capacidade de IA ao usuário, embarcada no fluxo do produto.',
        },
        {
          icon: 'Layers',
          title: 'Stack moderno, sênior',
          body: 'Next, Postgres, Drizzle, Payload, Tailwind. Arquitetura em camadas, testável, observável.',
        },
        {
          icon: 'Rocket',
          title: 'Entrega pra valer',
          body: 'Do MVP ao produto em produção. Sem parar no PowerPoint. Domínio próprio, deploy próprio.',
        },
      ],
      products_section_title: 'Produtos próprios',
      products_section_body:
        'Cada um com seu domínio, seu trial, sua dor. O CTA leva direto pro produto.',
      products_section_link_label: 'Ver todos',
      custom_section_title: 'Projeto sob demanda',
      custom_section_body:
        'Projetos personalizados para empresas médias e grandes. IA aplicada à dor real do negócio, integrada no software entregue ao seu cliente final.',
      custom_section_cta_label: 'Como funciona',
      custom_section_whatsapp_label: 'Tirar dúvidas',
      custom_section_aside_eyebrow: 'Como entregamos',
      custom_section_steps: [
        { text: '1. Diagnóstico curto da dor + escopo realista do MVP.' },
        { text: '2. Construção em ciclos curtos, deploy em staging cedo.' },
        { text: '3. Entrega ao cliente em produção, com observabilidade.' },
        { text: '4. Evolução incremental conforme uso real.' },
      ],
      blog_section_title: 'Do blog',
      blog_section_body: 'Adaptações editoriais do que está acontecendo em IA aplicada.',
      blog_section_link_label: 'Ler tudo',
      final_cta_title: 'Vamos conversar?',
      final_cta_body: 'Pega o WhatsApp aí. Sem formulário, sem fila. Resposta direta.',
    },
  })
  payload.logger.info('✓ HomePage populada')
}

async function seedProdutosPage(payload: AnyPayload) {
  const existing = await payload.findGlobal({ slug: 'produtos-page', depth: 0 })
  if ((existing as { title?: string }).title) {
    payload.logger.info('= ProdutosPage ja populada')
    return
  }
  await payload.updateGlobal({
    slug: 'produtos-page',
    data: {
      eyebrow: 'Produtos próprios',
      title: 'SaaS feitos para o cliente final usar IA.',
      subtitle:
        'Cada produto vive em domínio próprio. O Bitflix.com.br é vitrine — clique no card pra ir direto pro site, trial ou login.',
      empty_state_label: 'Em breve.',
      bottom_cta_title: 'Não achou o que precisa?',
      bottom_cta_body: 'Construímos sob demanda também. Conta pra gente o problema.',
    },
  })
  payload.logger.info('✓ ProdutosPage populada')
}

async function seedServicosPage(payload: AnyPayload) {
  const existing = await payload.findGlobal({ slug: 'servicos-page', depth: 0 })
  if ((existing as { title?: string }).title) {
    payload.logger.info('= ServicosPage ja populada')
    return
  }
  await payload.updateGlobal({
    slug: 'servicos-page',
    data: {
      eyebrow: 'Projetos sob demanda',
      title: 'Construímos software com IA para o cliente final do seu negócio.',
      subtitle:
        'Foco em médias e grandes empresas. Quando IA precisa chegar embarcada no produto que você entrega, não como produtividade interna do dev.',
      hero_cta_label: 'Solicitar orçamento',
      project_types_title: 'Tipos de projeto',
      project_types: [
        {
          icon: 'FlaskConical',
          title: 'MVPs com IA',
          body: 'Validar uma hipótese de IA em produção, com usuário real, em poucos ciclos.',
        },
        {
          icon: 'Network',
          title: 'Plataformas internas',
          body: 'Sistemas multi-usuário onde a IA agrega valor direto ao trabalho final do cliente.',
        },
        {
          icon: 'Cog',
          title: 'Integrações de IA',
          body: 'Plugar capacidade de IA em sistemas legados, bem desenhado, com guardrails.',
        },
        {
          icon: 'Shield',
          title: 'Auditoria + arquitetura',
          body: 'Reescrever ou consolidar bases existentes em arquitetura testável e observável.',
        },
      ],
      process_title: 'Como trabalhamos',
      process_steps: [
        {
          number: '01',
          title: 'Diagnóstico',
          body: 'Conversa direta sobre a dor, restrições, prazo, orçamento. Saída com escopo de MVP realista.',
        },
        {
          number: '02',
          title: 'Construção',
          body: 'Ciclos curtos, deploy em staging desde a primeira semana. Demos quinzenais ao seu time.',
        },
        {
          number: '03',
          title: 'Produção',
          body: 'Deploy em produção, observabilidade, runbook. Entrega ao seu cliente final.',
        },
        {
          number: '04',
          title: 'Evolução',
          body: 'Iterar conforme uso real. Sem cobrança fantasma. Cada ciclo é planejado e visível.',
        },
      ],
      stack_title: 'Stack atual',
      stack_intro:
        'Decisões pragmáticas e validadas. Cada item ajusta-se ao projeto, mas o eixo é estável.',
      stack_items: [
        { label: 'Next.js 15 + React 19' },
        { label: 'TypeScript 5.9' },
        { label: 'PostgreSQL 17' },
        { label: 'Drizzle ORM' },
        { label: 'Payload CMS 3' },
        { label: 'Tailwind 4 + shadcn/ui' },
        { label: 'Anthropic Claude / OpenAI' },
        { label: 'Docker + systemd' },
      ],
      bottom_cta_title: 'Conta o problema. Devolvemos um caminho.',
      bottom_cta_body:
        'Sem briefing longo. Conversa de 30 minutos no WhatsApp resolve a maior parte.',
    },
  })
  payload.logger.info('✓ ServicosPage populada')
}

async function seedSobrePage(payload: AnyPayload) {
  const existing = await payload.findGlobal({ slug: 'sobre-page', depth: 0 })
  if ((existing as { title?: string }).title) {
    payload.logger.info('= SobrePage ja populada')
    return
  }
  await payload.updateGlobal({
    slug: 'sobre-page',
    data: {
      eyebrow: 'Sobre a Bitflix',
      title: 'Dev house brasileira que entrega IA ao cliente final.',
      manifesto_section_title: 'Manifesto',
      author_section_title: 'Quem assina',
      author_bio_fallback: 'Bio em construção.',
      final_cta_title: 'Falar com a Bitflix',
      final_cta_body: 'Resposta direta. Sem fila, sem formulário.',
    },
  })
  payload.logger.info('✓ SobrePage populada')
}

async function seedContatoPage(payload: AnyPayload) {
  const existing = await payload.findGlobal({ slug: 'contato-page', depth: 0 })
  if ((existing as { title?: string }).title) {
    payload.logger.info('= ContatoPage ja populada')
    return
  }
  await payload.updateGlobal({
    slug: 'contato-page',
    data: {
      eyebrow: 'Contato',
      title: 'Sem formulário. Sem fila.',
      subtitle:
        'Conta o problema no WhatsApp. A gente devolve um caminho realista. Se não der pra atender, dizemos isso direto.',
    },
  })
  payload.logger.info('✓ ContatoPage populada')
}

await seed()
process.exit(0)
