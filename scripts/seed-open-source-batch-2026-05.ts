/**
 * Seed idempotente do batch Bitflix open source — maio/2026 (35 projetos).
 *
 * Cria 35 Articles em status `draft` + 35 OpenSourceCatalogEntry linkados,
 * com metadados publicos do GitHub. Lote sem fonte externa rastreada
 * (curadoria propria Bitflix).
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-open-source-batch-2026-05.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { slugify } from '../src/lib/slugify.ts'
import type { Article, OpenSourceCatalogEntry } from '../src/payload-types.ts'

type ProjectType =
  | 'ai-agent'
  | 'mcp'
  | 'llm-app'
  | 'developer-tool'
  | 'automation'
  | 'data-ai'
  | 'frontend'
  | 'backend'
  | 'infra'
  | 'security'
  | 'learning'
  | 'other'

interface CatalogSeed {
  rank: number
  name: string
  repo: string
  title: string
  pitch: string
  whenToUse: string
  whenNotToUse: string
  targetUsers: string[]
  projectType: ProjectType
  categories: string[]
  tags: string[]
}

interface GithubRepoMeta {
  description?: string | null
  homepage?: string | null
  language?: string | null
  license?: { spdx_id?: string | null; name?: string | null } | null
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number
  pushed_at?: string | null
  topics?: string[]
}

const DISCOVERY_SOURCE_URL = 'https://bitflix.com.br/blog'
const DISCOVERY_SOURCE_NAME = 'Curadoria Bitflix de open source — maio/2026'

function text(value: string) {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: value,
    type: 'text',
    version: 1,
  }
}

function paragraph(value: string) {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  }
}

function heading(value: string, tag: 'h2' | 'h3' = 'h2') {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

function code(value: string, language = 'bash') {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    language,
    type: 'code',
    version: 1,
  }
}

function repoParts(repoUrl: string) {
  const url = new URL(repoUrl)
  const [owner, repo] = url.pathname.replace(/^\/|\/$/g, '').split('/')
  return { owner, repo }
}

function articleSlug(seed: CatalogSeed) {
  return slugify(seed.title)
}

function entrySlug(seed: CatalogSeed) {
  return slugify(seed.name)
}

function licenseLabel(meta: GithubRepoMeta | null) {
  const spdx = meta?.license?.spdx_id
  if (spdx && spdx !== 'NOASSERTION') return spdx
  return meta?.license?.name ?? ''
}

function firstSentence(value: string) {
  const match = value.match(/^(.+?[.!?])\s/)
  return (match?.[1] ?? value).slice(0, 260)
}

function bodyLexical(seed: CatalogSeed, owner: string, repoName: string, meta: GithubRepoMeta | null) {
  const primaryLanguage = meta?.language ? ` O repositório aparece principalmente em ${meta.language}.` : ''
  const license = licenseLabel(meta)
  const licenseText = license ? ` A licença registrada no GitHub é ${license}.` : ''

  return {
    root: {
      children: [
        paragraph(
          `${seed.name} entrou nesta curadoria Bitflix de open source porque aponta para um problema real do ecossistema de software, IA ou automação. A descrição curta do projeto é direta: ${firstSentence(seed.pitch)}`,
        ),
        paragraph(
          `Este post transforma a descrição original em uma leitura editorial em PT-BR, com foco em utilidade prática, riscos e contexto para quem constrói produtos digitais. O repositório oficial é ${owner}/${repoName}.${primaryLanguage}${licenseText}`,
        ),

        heading(`O que é ${seed.name}`),
        paragraph(seed.pitch),
        paragraph(
          meta?.description
            ? `A descrição pública no GitHub resume o projeto assim: ${meta.description}`
            : 'Mesmo sem depender de metadados externos, o projeto se encaixa em uma tendência clara: ferramentas mais específicas, locais e conectáveis ao fluxo real de trabalho.',
        ),

        heading('Por que vale acompanhar'),
        paragraph(
          `${seed.name} é interessante porque reduz atrito em uma etapa que costuma ficar manual, dispersa ou frágil. Em vez de vender uma plataforma genérica, o projeto ataca um gargalo bem delimitado e tenta entregar uma interface utilizável para desenvolvedores, operadores ou usuários técnicos.`,
        ),
        paragraph(
          'Para a Bitflix, esse tipo de projeto importa porque mostra caminhos para entregar IA e automação como produto final: assistentes mais próximos do navegador, ferramentas locais, visualização de sistemas, verificação documental, ambientes de teste e componentes que tornam workflows complexos mais acessíveis.',
        ),

        heading('Quando faz sentido usar'),
        paragraph(seed.whenToUse),

        heading('Pontos de atenção'),
        paragraph(seed.whenNotToUse),
        paragraph(
          'Como regra prática, trate projetos novos do catálogo como candidatos a avaliação, não como recomendação cega de produção. Leia o README, confira licença, atividade do repositório, permissões exigidas e superfície de integração antes de colocar em um fluxo crítico.',
        ),

        heading('Primeiro contato técnico'),
        paragraph(
          'O ponto de partida deve ser o repositório oficial no GitHub. Para avaliar com segurança, clone em uma pasta descartável, leia o README e a licença, e só depois rode scripts de instalação.',
        ),
        code(`git clone ${seed.repo}
cd ${repoName}
# leia o README e a licença antes de rodar scripts do projeto`),

        heading('Leitura Bitflix'),
        paragraph(
          `A leitura Bitflix sobre ${seed.name}: vale acompanhar porque traduz uma tendência ampla em uma ferramenta concreta. Mesmo que ainda precise de validação técnica, o projeto ajuda a enxergar para onde o mercado está indo: agentes mais integrados ao ambiente real, ferramentas locais mais fortes e experiências de software com menos dependência de interfaces genéricas.`,
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

const seeds: CatalogSeed[] = [
  {
    rank: 1,
    name: 'Janitorr',
    repo: 'https://github.com/Schaka/janitorr',
    title: 'Janitorr: faxina automatizada do servidor Jellyfin antes do disco encher',
    pitch:
      'Janitorr conecta Jellyfin, Radarr, Sonarr e Jellyseerr, rastreia quando cada mídia foi assistida pela última vez e remove o que não está sendo consumido antes do espaço acabar. Inclui uma coleção "Leaving Soon" no Jellyfin como aviso antes da exclusão.',
    whenToUse:
      'Use em servidor de mídia self-hosted com biblioteca grande, usuários requisitando conteúdo que ninguém termina e disco perto do limite. Reduz fricção operacional sem precisar policiar pedidos manualmente.',
    whenNotToUse:
      'Evite em bibliotecas curadoria humana com mídia rara ou irrecuperável. Configure janelas conservadoras e listas de exclusão antes de soltar exclusão automática em qualquer mídia importante.',
    targetUsers: ['Self-hosters Jellyfin', 'Admins de servidores Plex/Jellyfin', 'Usuários Radarr/Sonarr', 'Operadores de NAS'],
    projectType: 'automation',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Jellyfin', 'Radarr', 'Sonarr', 'Jellyseerr', 'Storage cleanup', 'Self-hosted'],
  },
  {
    rank: 2,
    name: 'matcha',
    repo: 'https://github.com/floatpane/matcha',
    title: 'matcha: cliente de e-mail completo direto no terminal',
    pitch:
      'matcha é um cliente de e-mail TUI escrito em Go com Bubble Tea. Suporta múltiplas contas Gmail e Outlook via OAuth2, vim keybindings, renderiza HTML e exibe imagens inline usando o protocolo Kitty. Tem composer Markdown com autocomplete de contatos.',
    whenToUse:
      'Use se você vive no terminal, prefere Vim a clientes gráficos e quer múltiplas contas unificadas sem rodar Electron pesado. Ideal para fluxos de inbox processados por keybindings.',
    whenNotToUse:
      'Evite se depende de calendário corporativo, anexos pesados com preview rico ou colaboração em rascunhos compartilhados. Clientes TUI ainda perdem em integrações de produtividade.',
    targetUsers: ['Desenvolvedores que vivem no terminal', 'Usuários Vim/Neovim', 'Sysadmins', 'Power users de e-mail'],
    projectType: 'developer-tool',
    categories: ['Terminal', 'Produtividade'],
    tags: ['Email', 'TUI', 'Go', 'Bubble Tea', 'Vim', 'OAuth2'],
  },
  {
    rank: 3,
    name: 'Trailarr',
    repo: 'https://github.com/nandyalu/trailarr',
    title: 'Trailarr: trailers automáticos para a sua biblioteca Plex',
    pitch:
      'Trailarr é um app Docker que conecta Radarr, Sonarr e Plex, escaneia a biblioteca, detecta trailers faltando e baixa automaticamente. Verifica se o Plex já tem link remoto antes de baixar para economizar disco, renomeia no padrão Plex e dispara scan da biblioteca.',
    whenToUse:
      'Use se você mantém biblioteca Plex e quer trailers locais consistentes sem catalogar manualmente. Bom para home theaters com playback offline ou bandwidth limitado.',
    whenNotToUse:
      'Evite se prefere o link remoto do Plex (zero disco) ou se sua biblioteca é pequena demais para justificar mais um daemon rodando.',
    targetUsers: ['Self-hosters Plex', 'Home theater enthusiasts', 'Usuários Radarr/Sonarr', 'Operadores de NAS'],
    projectType: 'automation',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Plex', 'Radarr', 'Sonarr', 'Trailers', 'Docker', 'Media automation'],
  },
  {
    rank: 4,
    name: 'Prismarr',
    repo: 'https://github.com/Shoshuo/Prismarr',
    title: 'Prismarr: uma só interface para todo o stack arr self-hosted',
    pitch:
      'Prismarr sobe acima de Radarr, Sonarr, Prowlarr, Jellyseerr e clientes de download, consumindo todas as APIs por trás de uma interface Symfony moderna. Uma busca unificada consulta biblioteca local e TMDb juntos. Um calendário único mescla releases Radarr e estreias Sonarr.',
    whenToUse:
      'Use se cansou de seis abas abertas para gerenciar pedidos, downloads, calendário e métricas. Bom para self-hoster que prefere consolidar fluxo sem trocar componentes do stack.',
    whenNotToUse:
      'Evite se já tem dashboard customizado funcionando (Homarr, Heimdall) ou se prefere expor cada serviço diretamente para usar features avançadas que o agregador ainda não cobre.',
    targetUsers: ['Self-hosters experientes', 'Operadores de stack arr', 'Power users de mídia', 'Devs Symfony curiosos'],
    projectType: 'developer-tool',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Radarr', 'Sonarr', 'Prowlarr', 'Symfony', 'Dashboard', 'Self-hosted'],
  },
  {
    rank: 5,
    name: 'Signal',
    repo: 'https://github.com/jay-sahnan/signal',
    title: 'Signal: agente de pesquisa para outbound B2B que não vira spam',
    pitch:
      'Signal é um agente TypeScript self-hosted construído por um Growth Engineer da Browserbase. Recebe o seu Ideal Customer Profile e monta listas de contas-alvo varrendo a internet. Uma skill /company-research investiga cada prospect, lê novidades e detecta sinais de compra ativos antes do contato.',
    whenToUse:
      'Use em times de growth, founders solo ou SDRs que querem outbound personalizado sem assinar três SaaS de prospecção. Funciona melhor com ICP bem definido e fontes de news estáveis.',
    whenNotToUse:
      'Evite se já está em SaaS de prospecção que cumpre o que promete, ou se não tem disciplina para revisar listas antes de disparar — agente de pesquisa não substitui pensamento estratégico sobre quem abordar.',
    targetUsers: ['Growth engineers', 'Founders B2B', 'Times de SDR', 'Operadores de outbound'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Vendas'],
    tags: ['TypeScript', 'Browserbase', 'Sales', 'Outreach', 'ICP', 'Buying signals'],
  },
  {
    rank: 6,
    name: 'slskd',
    repo: 'https://github.com/slskd/slskd',
    title: 'slskd: cliente Soulseek moderno como daemon no seu NAS',
    pitch:
      'slskd é um cliente-servidor para a rede Soulseek pensado para self-host moderno. Sobe como daemon leve no Docker ao invés de manter um app desktop aberto no laptop. UI web moderna acessível de qualquer browser. Busca rápida, filtros, fila de download, salas de chat.',
    whenToUse:
      'Use se quer participar do Soulseek de forma estável sem manter desktop ligado. Ideal para NAS, mini-PC ou homelab que já rodam outros serviços de mídia.',
    whenNotToUse:
      'Evite se prefere apps desktop ricos para descoberta ou se sua jurisdição tem regras claras contra a rede em questão — entenda o cenário legal antes de subir o serviço.',
    targetUsers: ['Self-hosters', 'Coletores de música rara', 'Operadores de NAS', 'Entusiastas de áudio'],
    projectType: 'other',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Soulseek', 'P2P', 'Docker', 'Music', 'Self-hosted', 'Daemon'],
  },
  {
    rank: 7,
    name: 'arkon',
    repo: 'https://github.com/nduckmink/arkon',
    title: 'arkon: cérebro de conhecimento organizacional acoplado ao Claude via MCP',
    pitch:
      'arkon é uma plataforma middleware self-hosted que vira centro de conhecimento da organização. Você sobe políticas, specs de produto e handbooks, e o sistema compila tudo em um wiki estruturado e hierárquico. Funcionários conectam Claude Desktop ou Claude Code uma vez via MCP. Modelo de permissões Workspace + Global garante que finance só veja contexto financeiro e dev só veja engenharia.',
    whenToUse:
      'Use em organizações de médio porte com documentos espalhados que precisam virar contexto consultável por agentes, mantendo controle de quem vê o quê.',
    whenNotToUse:
      'Evite se ainda não definiu fronteiras claras de workspace ou se prefere alternativas SaaS que tiram a operação de você. Setup MCP exige cliente compatível em cada estação.',
    targetUsers: ['CTOs', 'Times de plataforma interna', 'Knowledge ops', 'Usuários Claude em empresa'],
    projectType: 'llm-app',
    categories: ['IA e agentes', 'Knowledge base'],
    tags: ['MCP', 'Claude', 'Knowledge management', 'RAG', 'Self-hosted', 'Permissions'],
  },
  {
    rank: 8,
    name: 'docmd',
    repo: 'https://github.com/docmd-io/docmd',
    title: 'docmd: gerador de docs estático sem React, sem bloat, só conteúdo',
    pitch:
      'docmd é um CLI rápido e zero dependências que gera site de docs production-ready direto de Markdown. Sem frameworks client-side. HTML puro, CSS, JS vanilla mínimo. Navegação automática, light/dark mode, tabs, cards e callouts via containers Markdown padrão. Suporte multi-project orquestra vários sites no mesmo repo.',
    whenToUse:
      'Use para docs internas, blog técnico minimalista ou portal de docs com várias áreas em um repo. Bom quando velocidade de page-load e simplicidade de build importam.',
    whenNotToUse:
      'Evite se precisa de busca facetada complexa, componentes interativos React ou ecossistema de plugins maduro (use Docusaurus, Astro Starlight). docmd é minimalista por escolha.',
    targetUsers: ['Tech writers', 'Devs solo', 'Times de plataforma com docs internas', 'Mantenedores de OSS'],
    projectType: 'developer-tool',
    categories: ['Documentação técnica', 'CLI'],
    tags: ['Markdown', 'Static site', 'CLI', 'Zero dependencies', 'Documentation', 'Multi-project'],
  },
  {
    rank: 9,
    name: 'helloesp',
    repo: 'https://github.com/Tech1k/helloesp',
    title: 'helloesp: site público hospedado em um ESP32 via tunnel Cloudflare',
    pitch:
      'helloesp é um site público funcional rodando inteiramente em um ESP32 de 520 KB de RAM. Páginas HTML, leituras de sensor ao vivo e guestbook dinâmico servidos do chip na sua mesa. O truque: tunnel WebSocket persistente saindo para um Cloudflare Worker, que relaya tráfego entrante pelo tunnel seguro. O ESP32 nunca aceita conexão TCP entrante.',
    whenToUse:
      'Use como projeto educativo, demo de arquitetura de tunneling, prova de conceito IoT ou inspiração para projetos com hardware fortemente restrito.',
    whenNotToUse:
      'Evite como infra de produção. ESP32 não escala carga, e dependência de tunnel + Worker adiciona pontos de falha que não fazem sentido fora de demo.',
    targetUsers: ['Makers', 'Estudantes de IoT', 'Pesquisadores embedded', 'Curiosos de Cloudflare Workers'],
    projectType: 'other',
    categories: ['Hardware', 'Web'],
    tags: ['ESP32', 'Cloudflare Workers', 'Tunnel', 'WebSocket', 'IoT', 'Hardware demo'],
  },
  {
    rank: 10,
    name: 'FIT Dashboard',
    repo: 'https://github.com/arpanghosh8453/fit-dashboard',
    title: 'FIT Dashboard: seus dados Garmin sem passar pelo Connect',
    pitch:
      'FIT Dashboard é um app desktop local-first em Rust e React. Você solta arquivos FIT do Garmin e recebe gráficos interativos de telemetria, rota colorida em mapa e estatísticas agregadas do histórico. Faz dedup automático e gera gráficos com histograma de frequência cardíaca e overlay comparativo entre atividades.',
    whenToUse:
      'Use se você prefere processar dados de wearable localmente, escapar do lock-in Garmin Connect ou cruzar atividades sem mandar dados para a nuvem.',
    whenNotToUse:
      'Evite se quer sync automático com a nuvem ou colaboração social (Strava). É ferramenta de análise pessoal, não rede social esportiva.',
    targetUsers: ['Atletas amadores', 'Analistas de dados pessoais', 'Usuários Garmin', 'Devs Rust'],
    projectType: 'other',
    categories: ['Desktop', 'Esportes'],
    tags: ['Rust', 'React', 'Garmin', 'FIT files', 'Local-first', 'Telemetry'],
  },
  {
    rank: 11,
    name: 'AudioMuse-AI',
    repo: 'https://github.com/NeptuneHub/AudioMuse-AI',
    title: 'AudioMuse-AI: playlists baseadas em como sua música realmente soa',
    pitch:
      'AudioMuse-AI é um engine Docker open-source que monta playlists analisando o áudio em si, não tags. Pipeline de deep learning local escuta seu acervo e extrai uma assinatura sonora baseada em harmonia, timbre e ritmo. Escolha uma seed song e ele encontra faixas com a mesma energia sonora. Music Map mostra sua biblioteca como uma galáxia 2D de som.',
    whenToUse:
      'Use se sua coleção musical está mal taggeada, se você quer descobrir conexões sonoras escondidas no acervo, ou se prefere análise audio-only a metadados crowdsourced.',
    whenNotToUse:
      'Evite se sua coleção é pequena demais para análise pagar a pena, ou se já está feliz com playlists do Spotify/Apple Music — o foco é acervo self-hosted.',
    targetUsers: ['Audiofilos', 'Self-hosters Jellyfin/Plex', 'Curadores de coleção musical', 'Pesquisadores MIR'],
    projectType: 'data-ai',
    categories: ['IA aplicada', 'Mídia'],
    tags: ['Music', 'Deep learning', 'Audio analysis', 'Self-hosted', 'Playlist', 'MIR'],
  },
  {
    rank: 12,
    name: 'Refearnapp',
    repo: 'https://github.com/ZAK123DSFDF/refearnapp',
    title: 'Refearnapp: programa de afiliados self-hosted com Stripe e Paddle',
    pitch:
      'Refearnapp é alternativa self-hosted para SaaS de rastreio de afiliados. Construído em Next.js, Cloudflare Edge e Drizzle, entregue como container Docker. Integração nativa com Stripe e Paddle rastreia referrals e calcula comissões sem expor chaves de API para plataforma de terceiros.',
    whenToUse:
      'Use em SaaS pequeno-médio que quer programa de afiliados sem mensalidade adicional nem expor base de clientes para fornecedor externo.',
    whenNotToUse:
      'Evite se ainda não tem volume de afiliados que justifique a operação, ou se precisa de features avançadas (multi-tier, fraud detection) que SaaS maduros já trazem.',
    targetUsers: ['Founders SaaS', 'Growth engineers', 'Indie hackers', 'Times de monetização'],
    projectType: 'backend',
    categories: ['Self-hosted', 'SaaS'],
    tags: ['Next.js', 'Stripe', 'Paddle', 'Drizzle', 'Cloudflare', 'Affiliate'],
  },
  {
    rank: 13,
    name: 'Future-AGI',
    repo: 'https://github.com/future-agi/future-agi',
    title: 'Future-AGI: observabilidade e eval de agentes em uma plataforma só',
    pitch:
      'Future-AGI consolida tooling de agentes em produção em uma única plataforma self-hostable. Monitoramento OpenTelemetry-native, gateway em Go aguentando 29.000 req/s e engine de avaliação checando 50+ métricas em uma chamada evaluate().',
    whenToUse:
      'Use se opera vários agentes em produção e cansou de plataforma fragmentada (Langfuse + LiteLLM + outra coisa para evals). Bom para times que querem stack único e self-host.',
    whenNotToUse:
      'Evite se ainda está em prototipagem (pode ser overkill) ou se já tem stack de observabilidade maduro funcionando — migração custa tempo que pode valer mais em produto.',
    targetUsers: ['Times de plataforma de IA', 'AI engineers', 'SREs de aplicações LLM', 'CTOs de empresas IA-first'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Observabilidade'],
    tags: ['OpenTelemetry', 'Go', 'Agents', 'Evals', 'Self-hosted', 'AI platform'],
  },
  {
    rank: 14,
    name: 'fireshare',
    repo: 'https://github.com/ShaneIsrael/fireshare',
    title: 'fireshare: biblioteca self-hosted de vídeos e screenshots com links únicos',
    pitch:
      'fireshare é biblioteca de mídia self-hosted que permite compartilhar seus próprios vídeos e screenshots via links únicos seguros. Monta sua pasta local no container Docker. Open Graph completo: cole o link no Discord e ele embeda com preview rico jogável, streaming direto do seu servidor. Puxa cover art do SteamGridDB. Transcoding CPU e GPU NVIDIA.',
    whenToUse:
      'Use para times pequenos compartilhando highlights de gameplay, devs com clipes de bug, ou criadores que querem link compartilhável sem subir conteúdo para Imgur/Streamable.',
    whenNotToUse:
      'Evite como substituto de CDN de produção. Sem cache distribuído, link compartilhado em escala vai sobrecarregar sua banda doméstica.',
    targetUsers: ['Gamers', 'Self-hosters', 'Criadores de conteúdo', 'Devs compartilhando reproducers'],
    projectType: 'other',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Video sharing', 'Docker', 'Open Graph', 'Discord embeds', 'GPU transcoding', 'Self-hosted'],
  },
  {
    rank: 15,
    name: 'Initiative',
    repo: 'https://github.com/Morelitea/initiative',
    title: 'Initiative: plataforma multi-tenant self-hosted com workspaces isolados',
    pitch:
      'Initiative é plataforma self-hosted com isolamento real multi-tenant via Guilds. Um container Docker hospeda seu time de dev, tarefas domésticas e campanha de RPG com bancos completamente isolados. Kanban completo, docs colaborativos em tempo real com comentários encadeados, whiteboards, planilhas com export CSV e integração BYOK com OpenAI/Anthropic para gerar subtasks.',
    whenToUse:
      'Use se quer um espaço único para times distintos sem precisar montar várias instâncias de Notion/ClickUp. Bom para freelancer com múltiplos clientes isolados.',
    whenNotToUse:
      'Evite se você precisa de integrações maduras (Slack, GitHub, Linear) já prontas. Plataforma jovem ainda não tem o catálogo de tools que SaaS pagos oferecem.',
    targetUsers: ['Freelancers multi-cliente', 'Times pequenos self-hosting', 'Comunidades', 'Famílias técnicas'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Produtividade'],
    tags: ['Multi-tenant', 'Kanban', 'Collaboration', 'Docker', 'BYOK AI', 'Workspaces'],
  },
  {
    rank: 16,
    name: 'AiSOC',
    repo: 'https://github.com/beenuar/AiSOC',
    title: 'AiSOC: SOC alimentado por IA, sem paywall e sem runtime fees',
    pitch:
      'AiSOC é centro de operações de segurança self-hosted com IA. Edição única, sem paywall, sem runtime fees. Entrega 16 integrações de source, correlação de eventos via Kafka e sistema de alerta baseado em risco que corta ruído na proporção 50:1. Agentes de triagem IA lembram casos passados e traçam blast radius de breach em tempo real.',
    whenToUse:
      'Use em times de SOC sobrecarregados de alerta que cansaram de pagar pricing enterprise de SIEM. Bom para empresas com dados internos sensíveis que não podem ir para SaaS.',
    whenNotToUse:
      'Evite se não tem time dedicado para responder alertas filtrados — ferramenta ajuda triagem, mas não substitui analista. Operar SOC exige humanos no loop.',
    targetUsers: ['SOC analysts', 'CISOs', 'Times de blue team', 'MSSPs'],
    projectType: 'security',
    categories: ['Segurança', 'Self-hosted'],
    tags: ['SOC', 'SIEM alternative', 'Kafka', 'AI triage', 'Self-hosted', 'Blue team'],
  },
  {
    rank: 17,
    name: 'tuliprox',
    repo: 'https://github.com/euzu/tuliprox',
    title: 'tuliprox: proxy IPTV em Rust que cabe num Raspberry Pi',
    pitch:
      'tuliprox é proxy IPTV self-hosted escrito em Rust, roda em Raspberry Pi, não precisa de banco externo e usa quase nada de RAM. Um container Docker puxa M3U, Xtream e mídia local, deixa filtrar e renomear canais via DSL custom e serve tudo como M3U, Xtream ou HDHomeRun.',
    whenToUse:
      'Use se tem múltiplos providers IPTV com playlists confusas e quer consolidar em uma única interface limpa para Plex/Jellyfin. Hardware mínimo.',
    whenNotToUse:
      'Evite se sua jurisdição tem restrições claras sobre os providers em questão — entenda o contexto legal antes de operar gateways IPTV.',
    targetUsers: ['Self-hosters', 'Usuários Plex/Jellyfin', 'Operadores de homelab', 'Devs Rust curiosos'],
    projectType: 'infra',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['IPTV', 'Rust', 'M3U', 'Xtream', 'HDHomeRun', 'Raspberry Pi'],
  },
  {
    rank: 18,
    name: 'Binderly',
    repo: 'https://github.com/Manan-Santoki/Binderly',
    title: 'Binderly: Markdown workbench com export PDF idêntico ao GitHub',
    pitch:
      'Binderly é workbench de Markdown que renderiza exatamente como GitHub, incluindo light/dark themes, GFM alerts e diagramas Mermaid que sobrevivem ao export PDF. Numeração de página, quebras limpas, sem watermark, sem limite de tamanho. Compartilhe doc com um clique e tenha link público read-only servido por Postgres.',
    whenToUse:
      'Use para escrever propostas, docs técnicas e relatórios que precisam virar PDF bonito sem perder Mermaid ou alerts. Bom para devs que querem fugir de Word/Notion para PDF.',
    whenNotToUse:
      'Evite se precisa de edição colaborativa em tempo real, comentários encadeados ou aprovações tipo Google Docs — o foco é autor solo + export.',
    targetUsers: ['Devs', 'Tech writers', 'Consultores técnicos', 'Estudantes de pós'],
    projectType: 'developer-tool',
    categories: ['Documentação técnica', 'Self-hosted'],
    tags: ['Markdown', 'PDF export', 'Mermaid', 'GitHub-style', 'Postgres', 'Self-hosted'],
  },
  {
    rank: 19,
    name: 'Torii',
    repo: 'https://github.com/nunoOliveiraqwe/torii',
    title: 'Torii: reverse proxy em Go pensado para a internet hostil',
    pitch:
      'Torii é reverse proxy Go feito para a realidade da internet hostil. Single binary, um arquivo de config, zero dependências. TLS via ACME, rate limiting, geo-blocking, checks AbuseIPDB e honeypots que pegam bots varrendo wp-login e .env. Tudo bloqueado vira evento no dashboard web ao vivo com timestamp e razão.',
    whenToUse:
      'Use para expor serviços self-hosted na internet aberta com defesa básica integrada, sem precisar montar nginx + fail2ban + cloudflare + watchtower separados.',
    whenNotToUse:
      'Evite em cenário enterprise complexo com requisitos WAF (use Caddy + plugins ou ModSecurity). Torii prioriza simplicidade, não cobertura exaustiva.',
    targetUsers: ['Self-hosters', 'SREs solo', 'Operadores de homelab exposto', 'Devs Go'],
    projectType: 'infra',
    categories: ['Infra', 'Segurança'],
    tags: ['Reverse proxy', 'Go', 'ACME', 'Rate limiting', 'AbuseIPDB', 'Honeypot'],
  },
  {
    rank: 20,
    name: 'CAAL',
    repo: 'https://github.com/CoreWorxLab/CAAL',
    title: 'CAAL: assistente de voz self-hosted onde o LLM nunca vê suas API keys',
    pitch:
      'CAAL é assistente de voz self-hosted com as credenciais vivendo no store encriptado do n8n, nunca no modelo. Qualquer workflow n8n vira tool ativável por voz. Controla Home Assistant, consulta APIs, encadeia tools em um prompt só. Vem com modelo fine-tuned 8B feito especificamente para tool calling por voz.',
    whenToUse:
      'Use em casa inteligente self-hosted onde você quer assistente de voz local sem mandar áudio nem credencial para nuvem de big tech.',
    whenNotToUse:
      'Evite se não tem hardware suficiente para rodar LLM 8B local com latência aceitável, ou se já depende de Alexa/Google Assistant integrados ao seu ecossistema.',
    targetUsers: ['Self-hosters Home Assistant', 'Usuários n8n', 'Privacy-focused makers', 'Devs IoT'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Smart home'],
    tags: ['Voice assistant', 'n8n', 'Home Assistant', 'Self-hosted', 'LLM 8B', 'Tool calling'],
  },
  {
    rank: 21,
    name: 'Stonks',
    repo: 'https://github.com/itskovacs/stonks',
    title: 'Stonks: tracker de carteira self-hosted sem broker e sem assinatura',
    pitch:
      'Stonks faz uma coisa: mostra o que você tem e como está. Self-hosted, um comando Docker, sem API keys pagas, dados direto do Yahoo Finance. Registre compras, vendas, dividendos e aportes. Veja PnL não realizado, allocation charts, risk scores e sinais de analistas.',
    whenToUse:
      'Use se quer acompanhar carteira diversificada sem dar acesso de broker para SaaS de terceiros nem pagar mensalidade. Ideal para investidor que entra manualmente.',
    whenNotToUse:
      'Evite se prefere sync automático com corretora — Stonks é input manual, é parte do design. Yahoo Finance também tem limites de cobertura para ativos brasileiros.',
    targetUsers: ['Investidores DIY', 'Self-hosters', 'Devs curiosos sobre finanças', 'Privacy-focused traders'],
    projectType: 'other',
    categories: ['Self-hosted', 'Finanças'],
    tags: ['Portfolio tracker', 'Self-hosted', 'Yahoo Finance', 'Docker', 'Dividends', 'PnL'],
  },
  {
    rank: 22,
    name: 'Stash',
    repo: 'https://github.com/alash3al/stash',
    title: 'Stash: camada de memória persistente para agentes MCP',
    pitch:
      'Stash é camada de memória persistente self-hosted para agentes MCP-compatíveis (Claude Desktop, Cursor, Ollama, OpenRouter). Observações brutas passam por pipeline de 8 estágios que transforma episódios em fatos, fatos em relacionamentos e relacionamentos em padrões. Guardado em Postgres com pgvector. Binary único, um comando Docker.',
    whenToUse:
      'Use se opera múltiplos agentes que se beneficiariam de memória cross-session compartilhada, ou se quer infra de memória controlável fora do app do cliente MCP.',
    whenNotToUse:
      'Evite se ainda não tem agente em produção que justifique infra de memória dedicada — Claude memory built-in cobre uso casual sem precisar de Postgres.',
    targetUsers: ['Usuários Claude Code', 'Builders de agentes MCP', 'AI engineers', 'Power users de Cursor'],
    projectType: 'mcp',
    categories: ['IA e agentes', 'MCP'],
    tags: ['MCP', 'Memory', 'pgvector', 'Postgres', 'Claude', 'Self-hosted'],
  },
  {
    rank: 23,
    name: 'oPodSync',
    repo: 'https://github.com/kd2org/opodsync',
    title: 'oPodSync: GPodder server em PHP, zero deps, roda em hospedagem compartilhada',
    pitch:
      'oPodSync é servidor GPodder-compatível self-hosted escrito em PHP, backed por SQLite, com zero dependências externas. Coloca em qualquer webserver, cria conta e aponta AntennaPod, Kasts ou gPodder direto. Suporta tanto API GPodder quanto NextCloud GPodder.',
    whenToUse:
      'Use se ouve podcast em vários dispositivos (Android + desktop) e quer sync sem ceder dados ao gpodder.net. Ideal para hospedagem compartilhada onde Docker não roda.',
    whenNotToUse:
      'Evite se já está satisfeito com sync nativo do Spotify/Apple Podcasts, ou se prefere apps que não suportam GPodder API.',
    targetUsers: ['Ouvintes multi-dispositivo', 'Self-hosters de hospedagem compartilhada', 'Privacy-focused podcasters', 'Usuários AntennaPod/Kasts'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['Podcast', 'GPodder', 'PHP', 'SQLite', 'Self-hosted', 'Zero deps'],
  },
  {
    rank: 24,
    name: 'Twenty',
    repo: 'https://github.com/twentyhq/twenty',
    title: 'Twenty: CRM open source para sair do Salesforce sem renovação cara',
    pitch:
      'Twenty é CRM open source construído para liberar dados do Salesforce. Self-host em Docker em minutos. Tem kanban e table views, objetos e campos custom, permissões role-based, workflow automation, sync de email e calendário. Seus dados, sua infra, suas regras.',
    whenToUse:
      'Use em SMB que cresceu cansado de planilha e quer CRM real sem entrar no jogo de pricing Salesforce/HubSpot. Bom para times técnicos que toparam manter o stack.',
    whenNotToUse:
      'Evite se precisa de marketplace maduro de integrações ou de features enterprise (forecasting avançado, AI-native pipeline scoring) que só Salesforce/HubSpot têm.',
    targetUsers: ['Times de vendas SMB', 'Founders B2B', 'CTOs', 'Ops técnico'],
    projectType: 'backend',
    categories: ['Self-hosted', 'CRM'],
    tags: ['CRM', 'Open source', 'Self-hosted', 'Salesforce alternative', 'Docker', 'Workflow'],
  },
  {
    rank: 25,
    name: 'BugPin',
    repo: 'https://github.com/aranticlabs/bugpin',
    title: 'BugPin: bug report visual para sua webapp em uma tag de script',
    pitch:
      'BugPin é ferramenta self-hosted de reporte visual de bug que você coloca em qualquer webapp com uma tag de script. Usuário clica, anota screenshot e envia. Reports caem no seu dashboard com contexto completo. Integração GitHub manda direto para issues. Deploy Docker em menos de um minuto, dados ficam no seu servidor.',
    whenToUse:
      'Use em produto B2B ou interno onde usuários técnicos podem reportar bugs com screenshot rico, sem você pagar mensalidade de SaaS de feedback visual.',
    whenNotToUse:
      'Evite se sua base de usuários inclui muitos não-técnicos que esperam tutorial guiado — ferramentas pagas têm UX mais polida para usuário leigo.',
    targetUsers: ['Devs solo', 'Times de produto', 'QA engineers', 'Suporte técnico'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Self-hosted'],
    tags: ['Bug reporting', 'Screenshot', 'GitHub integration', 'Self-hosted', 'Docker', 'Feedback'],
  },
  {
    rank: 26,
    name: 'Omni',
    repo: 'https://github.com/getomnico/omni',
    title: 'Omni: assistente de IA que indexa Drive, Slack, Confluence, Jira e Gmail',
    pitch:
      'Omni é assistente self-hosted de workplace que indexa Google Drive, Slack, Confluence, Jira e Gmail. Full-text e busca semântica em um lugar só, alimentado por um único banco Postgres, sem Elasticsearch nem vector DB separado. Agente IA lê documentos, busca nos apps conectados e roda Python sandboxed para analisar dados.',
    whenToUse:
      'Use em time médio onde conhecimento está espalhado entre várias ferramentas e ninguém acha mais nada. Bom para self-host quando dados não podem sair da empresa.',
    whenNotToUse:
      'Evite se ainda está em fase de consolidar processos — adicionar busca em cima de caos só cristaliza o caos. Limpe taxonomia primeiro.',
    targetUsers: ['Knowledge ops', 'CTOs', 'Times de plataforma interna', 'IT leaders'],
    projectType: 'llm-app',
    categories: ['IA aplicada', 'Knowledge base'],
    tags: ['Workplace search', 'RAG', 'Postgres', 'Self-hosted', 'Python sandbox', 'Multi-source'],
  },
  {
    rank: 27,
    name: 'EDDI',
    repo: 'https://github.com/labsai/EDDI',
    title: 'EDDI: orquestração multi-agente para empresa regulada, em Java',
    pitch:
      'EDDI é engine de orquestração multi-agente config-driven construído sobre Quarkus e Java 25. Você define agentes em JSON, não em código. Suporta 12 providers LLM, protocolos MCP e A2A, RAG, memória persistente, e tem compliance GDPR, HIPAA e EU AI Act embutidos com ledger imutável de auditoria.',
    whenToUse:
      'Use em empresa regulada (saúde, finance, governo) que precisa de agentes IA com trilha de auditoria forte e que prefere stack Java enterprise a Python.',
    whenNotToUse:
      'Evite em time pequeno fazendo protótipo — JSON-driven é poderoso mas tem curva, e Quarkus exige operação Java. Use LangGraph ou similar para mover rápido.',
    targetUsers: ['Times de IA em empresa regulada', 'Java enterprise architects', 'Compliance officers', 'Engenheiros de plataforma'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Enterprise'],
    tags: ['Java', 'Quarkus', 'Multi-agent', 'MCP', 'A2A', 'Compliance'],
  },
  {
    rank: 28,
    name: 'wakit',
    repo: 'https://github.com/matiasbattocchia/wakit-api',
    title: 'wakit: plataforma WhatsApp Business open source em Supabase + Deno',
    pitch:
      'wakit é plataforma WhatsApp Business open source construída em Supabase e Deno. Multi-tenant, self-hostável em menos de 15 minutos forkando o repo e conectando um projeto Supabase. Suporta agentes IA via Chat Completions e A2A protocols, MCP server incluído, processamento de mídia para áudio/imagem/PDF e plugin Claude Code que deixa o Claude responder mensagens WhatsApp direto.',
    whenToUse:
      'Use em SMB brasileira que quer automação WhatsApp sem virar refém de plataformas locais, mantendo controle sobre fluxos de mensagem e dados de cliente.',
    whenNotToUse:
      'Evite se não tem tempo para operar Supabase + Deno em produção. Plataformas SaaS BR de WA têm onboarding mais rápido para quem não opera infra.',
    targetUsers: ['Founders SMB brasileiros', 'Times de growth', 'Builders de chatbot', 'Devs Deno'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Mensageria'],
    tags: ['WhatsApp', 'Supabase', 'Deno', 'Multi-tenant', 'MCP', 'A2A'],
  },
  {
    rank: 29,
    name: 'LubeLogger',
    repo: 'https://github.com/hargata/lubelog',
    title: 'LubeLogger: tracker self-hosted de manutenção e combustível do seu carro',
    pitch:
      'LubeLogger é tracker self-hosted web de manutenção e consumo veicular. Registre cada serviço, reparo e abastecimento em múltiplos veículos. Veja breakdown de custo, gráficos de consumo e manutenção próxima de bater. Deploy Docker, Helm chart para Kubernetes, suporta PostgreSQL.',
    whenToUse:
      'Use se mantém vários carros (frota familiar, oficina de hobby) e quer histórico real de manutenção sem usar planilha ou app proprietário com cloud opaco.',
    whenNotToUse:
      'Evite se você só tem um carro e raramente atualiza serviço — overhead de operar Docker não compensa para uso casual.',
    targetUsers: ['Entusiastas automotivos', 'Famílias multi-carro', 'Operadores de pequena frota', 'Self-hosters'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Produtividade'],
    tags: ['Vehicle tracking', 'Maintenance', 'Docker', 'PostgreSQL', 'Self-hosted', 'Kubernetes'],
  },
  {
    rank: 30,
    name: 'Jabali',
    repo: 'https://github.com/shukiv/jabali-panel',
    title: 'Jabali: painel de hospedagem web moderno, alternativa open source ao cPanel',
    pitch:
      'Jabali é painel de controle de hospedagem web open source construído em Laravel e Filament. Domínios, DNS com DNSSEC, SSL, gestão WordPress com SSO, MySQL, PostgreSQL, stack mail completo com webmail, file manager, backups, Fail2ban, ClamAV e migração de cPanel. Tudo em uma interface. Container Docker único ou pacote APT em Debian.',
    whenToUse:
      'Use em hospedagem self-managed para sair de cPanel/Plesk caros, ou em VPS pessoal onde você quer painel sem licenciamento proprietário.',
    whenNotToUse:
      'Evite se opera escala grande com requisitos de cluster multi-node — painel jovem ainda não tem maturidade de cPanel para HA enterprise.',
    targetUsers: ['Operadores de hospedagem solo', 'Devs com VPS pessoal', 'Pequenos provedores', 'Sysadmins Debian'],
    projectType: 'infra',
    categories: ['Self-hosted', 'Infra'],
    tags: ['Hosting panel', 'Laravel', 'Filament', 'cPanel alternative', 'Docker', 'DNS'],
  },
  {
    rank: 31,
    name: 'LitePay',
    repo: 'https://github.com/szerookii/litepay',
    title: 'LitePay: processador self-hosted de pagamentos Bitcoin, Litecoin e Solana',
    pitch:
      'LitePay é processador de pagamento crypto self-hosted para Bitcoin, Litecoin e Solana. Sem intermediários, sem fees, sem custódia de terceiros. Construído em Go com frontend Svelte. Sua master seed fica no seu próprio vault (HashiCorp Vault, Bitwarden, AWS ou env variable). Webhooks com assinatura HMAC. Deploy Docker em minutos.',
    whenToUse:
      'Use em marketplace ou produto digital com público crypto que quer aceitar pagamento on-chain sem render fees para Stripe/Coinbase Commerce.',
    whenNotToUse:
      'Evite se não tem operação para lidar com volatilidade, conversão fiat ou compliance KYC do seu mercado — auto-custódia de seed pesa muito.',
    targetUsers: ['Founders crypto', 'Operadores de marketplace digital', 'Devs Go/Svelte', 'Self-hosters'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Pagamentos'],
    tags: ['Bitcoin', 'Litecoin', 'Solana', 'Go', 'Svelte', 'Self-custody'],
  },
  {
    rank: 32,
    name: 'Kandev',
    repo: 'https://github.com/kdlbs/kandev',
    title: 'Kandev: control plane self-hosted para rodar múltiplos agentes de código em paralelo',
    pitch:
      'Kandev é control plane self-hosted para gerenciar agentes de código em paralelo. Kanban board, terminal integrado, code editor com LSP, painel de git diff e browser preview em um workspace. Suporta Claude Code, Codex e outros. Cada tarefa roda em git worktree próprio, então agentes nunca pisam um no outro.',
    whenToUse:
      'Use se opera 3+ agentes simultaneamente (Claude Code, Codex, etc.) e cansou de não saber o que cada um está fazendo. Bom para devs que delegam várias tarefas em paralelo.',
    whenNotToUse:
      'Evite se você só usa um agente por vez — overhead de control plane não compensa. Comece com tmux + worktree manual antes de adicionar plataforma.',
    targetUsers: ['Power users de Claude Code', 'Devs com workflow multi-agent', 'AI-first engineers', 'Vibe coders'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'IA e agentes'],
    tags: ['Claude Code', 'Codex', 'Git worktree', 'Multi-agent', 'Self-hosted', 'Kanban'],
  },
  {
    rank: 33,
    name: 'Telepage',
    repo: 'https://github.com/scibilo/telepage',
    title: 'Telepage: transforma seu canal Telegram em site indexável pelo Google',
    pitch:
      'Telepage é app PHP self-hosted que transforma qualquer canal Telegram em site SEO-friendly via webhooks. Sem MySQL, sem Node.js, roda em hospedagem compartilhada comum. Cada post novo aparece no seu site em segundos. Integração opcional Gemini auto-tagga e resume conteúdo.',
    whenToUse:
      'Use se você publica conteúdo de valor em canal Telegram e quer que esse conteúdo seja indexado no Google ou compartilhado fora do app.',
    whenNotToUse:
      'Evite se conteúdo do canal é privado ou efêmero — replicar em site público muda o contrato com os assinantes do canal.',
    targetUsers: ['Criadores de conteúdo Telegram', 'Newsletters técnicas', 'Comunidades de nicho', 'Self-hosters PHP'],
    projectType: 'backend',
    categories: ['Self-hosted', 'Web'],
    tags: ['Telegram', 'PHP', 'SEO', 'Webhooks', 'Self-hosted', 'Gemini'],
  },
  {
    rank: 34,
    name: 'Snacks',
    repo: 'https://github.com/derekshreds/snacks',
    title: 'Snacks: re-encode em massa sua biblioteca H.264 para H.265 ou AV1',
    pitch:
      'Snacks automatiza o pipeline de re-encode. Aponte para seu NAS ou biblioteca local, ele varre com FFprobe, pula arquivos que já bateriam o bitrate alvo e re-encoda o resto em batch com aceleração de hardware NVIDIA, Intel ou AMD. Imagem Docker para QNAP e Synology, app desktop Windows, modo cluster para distribuir jobs.',
    whenToUse:
      'Use se sua biblioteca H.264 está consumindo TBs que poderiam virar metade em HEVC/AV1, e você tem GPU/CPU ocioso para o trabalho.',
    whenNotToUse:
      'Evite se não tem backup dos arquivos originais antes de re-encodar, ou se sua biblioteca já está em H.265 — re-encode duplo destrói qualidade.',
    targetUsers: ['Self-hosters de mídia', 'Operadores de NAS', 'Entusiastas de codec', 'Time de archive digital'],
    projectType: 'automation',
    categories: ['Self-hosted', 'Mídia'],
    tags: ['FFmpeg', 'H.265', 'AV1', 'Hardware encoding', 'Docker', 'Cluster'],
  },
  {
    rank: 35,
    name: 'Questarr',
    repo: 'https://github.com/Doezer/Questarr',
    title: 'Questarr: Sonarr e Radarr, mas para a sua biblioteca de jogos',
    pitch:
      'Questarr traz a experiência Sonarr/Radarr para video games. Gerenciador self-hosted com metadata IGDB, calendário de releases, tracker de wishlist e gestão completa de download via Prowlarr, qBittorrent, Transmission, SABnzbd e outros. Navegue novos releases, adicione à lista wanted e deixe ele procurar automaticamente.',
    whenToUse:
      'Use se você é colecionador de jogos de PC e quer a mesma automação que já tem para filmes/séries, com calendário e wishlist integrados.',
    whenNotToUse:
      'Evite se sua jurisdição tem restrições sobre os indexers em questão — entenda contexto legal antes de operar. Para acervo legalmente adquirido, basta GOG Galaxy ou Steam.',
    targetUsers: ['Self-hosters de mídia', 'Coletores de jogos PC', 'Operadores de homelab', 'Usuários Prowlarr'],
    projectType: 'automation',
    categories: ['Self-hosted', 'Games'],
    tags: ['Games', 'IGDB', 'Prowlarr', 'qBittorrent', 'Self-hosted', 'Wishlist'],
  },
]

async function fetchGithubMeta(owner: string, repo: string): Promise<GithubRepoMeta | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bitflix-open-source-batch-2026-05',
  }
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    console.warn(
      `GitHub metadata indisponivel para ${owner}/${repo}: HTTP ${response.status}; remaining=${remaining ?? 'n/a'}; reset=${reset ?? 'n/a'}`,
    )
    return null
  }

  return (await response.json()) as GithubRepoMeta
}

async function findOneBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'authors' | 'categories' | 'tags' | 'articles' | 'open-source-catalog-entries',
  slug: string,
) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

async function ensureTerm(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'categories' | 'tags',
  name: string,
) {
  const slug = slugify(name)
  const existing = await findOneBySlug(payload, collection, slug)
  if (existing?.id) return existing.id

  const created = await payload.create({
    collection,
    data: { name, slug, is_active: true },
  })
  return created.id
}

async function ensureAuthor(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await findOneBySlug(payload, 'authors', 'milton-bastos')
  if (existing?.id) return existing.id

  const created = await payload.create({
    collection: 'authors',
    data: {
      name: 'Milton Bastos',
      slug: 'milton-bastos',
      bio: 'Fundador da Bitflix. Escreve sobre software, IA aplicada e produtos digitais.',
      email: 'miltonbastos@gmail.com',
    },
  })
  return created.id
}

async function upsertArticle(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: CatalogSeed,
  authorId: number,
  categoryIds: number[],
  tagIds: number[],
  meta: GithubRepoMeta | null,
) {
  const { owner, repo } = repoParts(seed.repo)
  const slug = articleSlug(seed)
  const data = {
    title: seed.title,
    slug,
    excerpt: firstSentence(seed.pitch),
    body_lexical: bodyLexical(seed, owner, repo, meta),
    source: {
      original_title: seed.name,
      original_author: owner,
      original_site: 'GitHub',
      original_url: seed.repo,
      license_note: `Artigo baseado na descrição enviada pelo usuário e em metadados públicos do GitHub consultados em ${new Date().toLocaleDateString('pt-BR')}.`,
    },
    language_origin: 'en',
    disclaimer_variant: 'ai-adapted-from-text',
    is_bitflix_take: true,
    author: authorId,
    categories: categoryIds,
    tags: tagIds,
    status: 'published',
    published_at: new Date().toISOString(),
    is_active: true,
    created_via: 'manual',
  }

  const existing = await findOneBySlug(payload, 'articles', slug)
  if (existing?.id) {
    return (await payload.update({
      collection: 'articles',
      id: existing.id,
      data: data as never,
    })) as Article
  }

  return (await payload.create({
    collection: 'articles',
    data: data as never,
  })) as Article
}

async function upsertCatalogEntry(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: CatalogSeed,
  article: Article,
  categoryIds: number[],
  tagIds: number[],
  meta: GithubRepoMeta | null,
) {
  const { owner, repo } = repoParts(seed.repo)
  const existing = await findOneBySlug(payload, 'open-source-catalog-entries', entrySlug(seed))
  const data = {
    title: seed.name,
    slug: entrySlug(seed),
    article: article.id,
    repository_url: seed.repo,
    repository_owner: owner,
    repository_name: repo,
    source_links: [
      { label: 'Repositório GitHub', url: seed.repo },
      { label: 'README', url: `${seed.repo}/blob/main/README.md` },
    ],
    summary_pt_br: firstSentence(seed.pitch),
    what_it_does: seed.pitch,
    when_to_use: seed.whenToUse,
    when_not_to_use: seed.whenNotToUse,
    target_users: seed.targetUsers.map((label) => ({ label })),
    project_type: seed.projectType,
    categories: categoryIds,
    tags: tagIds,
    last_checked_at: new Date().toISOString(),
    readme_excerpt: seed.pitch.slice(0, 1200),
    discovery_source_url: DISCOVERY_SOURCE_URL,
    discovery_source_name: DISCOVERY_SOURCE_NAME,
    catalog_status: 'published',
    is_featured: seed.rank <= 5,
    is_active: true,
    ...(meta
      ? {
          homepage_url: meta.homepage || undefined,
          description_original: meta.description ?? '',
          github_topics: (meta.topics ?? []).slice(0, 12).map((topic) => ({ topic })),
          primary_language: meta.language ?? undefined,
          license: licenseLabel(meta) || undefined,
          stars: meta.stargazers_count ?? 0,
          forks: meta.forks_count ?? 0,
          open_issues: meta.open_issues_count ?? 0,
          last_pushed_at: meta.pushed_at ?? undefined,
        }
      : {}),
  }

  if (existing?.id) {
    return (await payload.update({
      collection: 'open-source-catalog-entries',
      id: existing.id,
      data: data as never,
    })) as OpenSourceCatalogEntry
  }

  return (await payload.create({
    collection: 'open-source-catalog-entries',
    data: data as never,
  })) as OpenSourceCatalogEntry
}

async function upsertImportRecord(payload: Awaited<ReturnType<typeof getPayload>>, importedCount = 0, done = false) {
  const existingImport = await payload.find({
    collection: 'open-source-catalog-imports',
    where: {
      and: [{ source_url: { equals: DISCOVERY_SOURCE_URL } }, { source_name: { equals: DISCOVERY_SOURCE_NAME } }],
    },
    limit: 1,
    sort: 'createdAt',
  })

  const data = {
    source_url: DISCOVERY_SOURCE_URL,
    source_name: DISCOVERY_SOURCE_NAME,
    requested_by: 'Milton Bastos via Claude Code',
    status: done ? 'done' : 'running',
    repos_found_count: seeds.length,
    repos_imported_count: importedCount,
    repos_skipped_count: 0,
    started_at: new Date().toISOString(),
    finished_at: done ? new Date().toISOString() : undefined,
    notes:
      'Lote criado a partir do conteúdo colado pelo usuário no chat. Curadoria Bitflix sem fonte externa rastreada. Articles publicados direto (parity com weekly-31).',
  } as const

  if (existingImport.docs[0]?.id) {
    return payload.update({
      collection: 'open-source-catalog-imports',
      id: existingImport.docs[0].id,
      data: data as never,
    })
  }

  return payload.create({
    collection: 'open-source-catalog-imports',
    data,
  })
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const payload = await getPayload({ config })
  const authorId = await ensureAuthor(payload)
  let importRecord = await upsertImportRecord(payload)
  const indexedDocs: Array<Record<string, unknown>> = []

  for (const seed of seeds) {
    const { owner, repo } = repoParts(seed.repo)
    const meta = await fetchGithubMeta(owner, repo)
    const categoryIds = []
    const tagIds = []

    for (const name of seed.categories) categoryIds.push(await ensureTerm(payload, 'categories', name))
    for (const name of seed.tags) tagIds.push(await ensureTerm(payload, 'tags', name))

    const article = await upsertArticle(payload, seed, authorId, categoryIds, tagIds, meta)
    const entry = await upsertCatalogEntry(payload, seed, article, categoryIds, tagIds, meta)

    await payload.update({
      collection: 'open-source-catalog-entries',
      id: entry.id,
      data: { discovery_batch_id: importRecord.id } as never,
    })

    indexedDocs.push({
      rank: seed.rank,
      name: seed.name,
      repository: seed.repo,
      article: `/blog/${article.slug}`,
      catalogSlug: entry.slug,
      projectType: seed.projectType,
      primaryLanguage: meta?.language ?? null,
      license: licenseLabel(meta) || null,
      stars: meta?.stargazers_count ?? null,
      summary: firstSentence(seed.pitch),
      whatItDoes: seed.pitch,
      whenToUse: seed.whenToUse,
      whenNotToUse: seed.whenNotToUse,
      targetUsers: seed.targetUsers,
      tags: seed.tags,
      githubTopics: meta?.topics ?? [],
    })

    importRecord = await upsertImportRecord(payload, indexedDocs.length)
    console.log(`✓ ${seed.rank}. ${seed.name} -> /blog/${article.slug}`)
    await sleep(900)
  }

  importRecord = await upsertImportRecord(payload, indexedDocs.length, true)

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        total: indexedDocs.length,
        importId: importRecord.id,
        source: DISCOVERY_SOURCE_NAME,
        indexedDocs,
      },
      null,
      2,
    ),
  )
}

await main()
