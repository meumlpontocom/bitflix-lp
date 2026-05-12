/**
 * Seed idempotente do batch Bitflix open source — maio/2026 (35 projetos Claude skills + agent tooling).
 *
 * Cria 35 Articles em status `draft` + 35 OpenSourceCatalogEntry linkados em `draft`,
 * com metadados publicos do GitHub. Lote sem fonte externa rastreada
 * (curadoria propria Bitflix, foco Claude Code / agent skills / AI tooling).
 *
 * User pediu drafts explicitamente nesta rodada (revisao no admin antes de publicar).
 * Para publicar em massa apos revisao:
 *   - rodar /api/blog-publish em cada slug
 *   - depois flip `catalog_status` -> 'published' nas entries do batch (limitacao /api/blog-publish, ver memoria feedback_blog_publish_scope)
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-open-source-batch-2026-05-claude-skills.ts
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
const DISCOVERY_SOURCE_NAME = 'Curadoria Bitflix — Claude skills & agent tooling maio/2026'

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
    name: 'claude-video',
    repo: 'https://github.com/bradautomates/claude-video',
    title: 'claude-video: o Claude finalmente assiste vídeo no YouTube e no disco',
    pitch:
      'claude-video é uma skill custom que ensina o Claude a consumir vídeo de verdade. Cole um link do YouTube ou um caminho local e a skill baixa o arquivo, extrai frames em taxa auto-escalada, puxa o transcript com timestamp e entrega tudo pro modelo. Quando o Claude responde, ele literalmente já viu o vídeo e ouviu o áudio.',
    whenToUse:
      'Use quando precisa que o agente entenda conteúdo audiovisual — tutoriais técnicos, demos de produto, análise de aulas, briefings em vídeo — sem precisar transcrever na mão. Bom para times de pesquisa, suporte e curadoria que vivem dentro do Claude Code.',
    whenNotToUse:
      'Evite para vídeo confidencial sem revisão de privacidade — frames e transcript vão pra dentro do contexto do modelo. Vídeos muito longos podem estourar janela de contexto, exigem trim antes.',
    targetUsers: ['Devs que usam Claude Code', 'Times de pesquisa', 'Educadores e curadores', 'Power users de IA'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Vídeo', 'YouTube', 'Transcript', 'Multimodal'],
  },
  {
    rank: 2,
    name: 'WRITING.md',
    repo: 'https://github.com/Anbeeld/WRITING.md',
    title: 'WRITING.md: um arquivo só que força a IA a escrever como gente',
    pitch:
      'WRITING.md é um único arquivo Markdown que você cola no root do projeto. Carrega regras editoriais que forçam o agente a usar frases curtas, voz humana e elimina filler típico de IA — "delve into", "crucial", "in conclusion". Voz de dev sênior aplicada por um arquivo de texto.',
    whenToUse:
      'Use em qualquer projeto onde o agente escreve docs, READMEs, PRs ou copy. Especialmente em times que cansaram de revisar texto genérico de IA antes de cada commit.',
    whenNotToUse:
      'Evite se sua organização exige tom corporativo formal — as regras agressivas podem soar secas em contextos jurídicos ou de marketing institucional.',
    targetUsers: ['Devs cansados de prosa AI', 'Tech writers', 'PMs que escrevem com IA', 'Founders'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Cursor', 'Agent Rules', 'Writing', 'Prompts', 'Docs'],
  },
  {
    rank: 3,
    name: 'fancyai-skills',
    repo: 'https://github.com/fancyai-official/skills',
    title: 'fancyai/skills: educação de UI premium para o seu agente em um install',
    pitch:
      'O Claude Code constrói UIs funcionais que parecem todas iguais. fancyai-official/skills é um pacote focado de agent skills para geração de UI premium. Depois do install, o agente entende como aplicar Framer Motion, glassmorphism balanceado e efeitos de scroll estilo Apple corretamente. Treinamento de frontend design para a IA, em um único pacote.',
    whenToUse:
      'Use quando seu agente entrega UIs sem distinção visual e você quer subir o nível sem virar designer manualmente. Bom para landing pages, produtos com pretensão de design e MVPs que precisam impressionar.',
    whenNotToUse:
      'Evite em produtos B2B utilitários onde personalidade visual atrapalha — dashboards densos, ferramentas internas. Animações premium em excesso prejudicam usabilidade.',
    targetUsers: ['Devs frontend solo', 'Designers que codam', 'Founders de SaaS', 'Estúdios indie'],
    projectType: 'developer-tool',
    categories: ['Design', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Frontend', 'UI', 'Framer Motion', 'Design'],
  },
  {
    rank: 4,
    name: 'paper2code',
    repo: 'https://github.com/PrathamLearnsToCode/paper2code',
    title: 'paper2code: paper do arXiv vira PyTorch executável',
    pitch:
      'Ler um paper do arXiv e implementá-lo são problemas totalmente diferentes. paper2code recebe o PDF da pesquisa, lê a metodologia, extrai a matemática e traduz direto em código PyTorch executável e bem comentado. Pesquisa IA bleeding-edge rodando no seu hardware sem o trabalho manual de reimplementar.',
    whenToUse:
      'Use para reproduzir papers de ML quando precisa de baseline funcional rápido — antes de decidir se vale investir tempo na implementação cuidadosa. Bom para grad students e times de pesquisa aplicada.',
    whenNotToUse:
      'Evite quando precisa de implementação de produção otimizada — código gerado é didático, não otimizado. Sempre revise antes de publicar resultados em paper próprio.',
    targetUsers: ['Pesquisadores ML', 'Grad students', 'Devs ML aplicada', 'Engenheiros de pesquisa'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Pesquisa'],
    tags: ['Claude Code', 'PyTorch', 'ML', 'Research', 'arXiv', 'Agent Skills'],
  },
  {
    rank: 5,
    name: 'garden-skills',
    repo: 'https://github.com/ConardLi/garden-skills',
    title: 'garden-skills: skills de produção curados para Claude e Codex',
    pitch:
      'Escrever system prompts do zero cansa. garden-skills é uma coleção curada de skills production-ready para Claude Code e Codex. Destaques incluem Web Design Engineer com filosofia Anthropic Claude Design (color theory + anti-cliché), uma skill RAG que limita retrieval a offset/limit precisos e uma skill GPT Image 2 com 70+ templates de prompt estruturados.',
    whenToUse:
      'Use como ponto de partida para qualquer agente que precise gerar UI, fazer RAG ou criar imagem. Economiza horas de iteração de prompt em casos comuns.',
    whenNotToUse:
      'Evite carregar tudo de uma vez — escolha 2-3 skills do pacote relevantes ao seu caso, ou o agente vira lento e indeciso entre frameworks competindo.',
    targetUsers: ['Devs Claude Code', 'Engenheiros de prompt', 'Times de IA aplicada', 'Solo devs'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Codex', 'Agent Skills', 'RAG', 'GPT Image', 'Prompts'],
  },
  {
    rank: 6,
    name: 'social-media-skills',
    repo: 'https://github.com/charlie947/social-media-skills',
    title: 'social-media-skills: o sistema de conteúdo do Charlie Hills em 17 skills',
    pitch:
      'Charlie Hills (350K followers, 100M views) abriu o código de todo o sistema de produção de conteúdo dele como 17 skills Claude Code. Um voice-builder entrevista você e captura seu tom exato em arquivo persistente. Daí: geração de Content Matrix, análise histórica de posts para grading de drafts novos, criação de infográficos e thumbnails. Seu sistema de conteúdo, construído em volta da sua voz real.',
    whenToUse:
      'Use se está sério sobre construir audiência em redes sociais e cansou de prompts genéricos que produzem conteúdo que parece de qualquer um. Bom para creators solo, founders construindo em público e times de marketing.',
    whenNotToUse:
      'Evite se ainda não tem corpus de conteúdo próprio — voice-builder precisa de exemplos pra calibrar. Sem dados históricos, o sistema vira só template genérico.',
    targetUsers: ['Creators', 'Founders públicos', 'Times de marketing', 'Solo founders'],
    projectType: 'ai-agent',
    categories: ['Marketing', 'IA aplicada'],
    tags: ['Claude Code', 'Agent Skills', 'Social Media', 'Content', 'Marketing', 'Voice'],
  },
  {
    rank: 7,
    name: 'mattpocock-skills',
    repo: 'https://github.com/mattpocock/skills',
    title: 'mattpocock/skills: primitivos sharp para TDD, triage e vertical slices',
    pitch:
      'A maioria dos prompts Claude Code é kitchen-sink — dá espaço demais pro modelo pensar demais. As skills do Matt Pocock são o oposto. Primitivos pequenos, afiados, single-purpose para TDD, GitHub triage e quebra de arquitetura em vertical slices. Vocabulário controlado via LANGUAGE.md que define termos arquiteturais com avisos contra substituição por sinônimos. Força o agente a agir como ferramenta de precisão.',
    whenToUse:
      'Use em codebases TypeScript onde já há disciplina de arquitetura — TDD, vertical slices, separação clara de camadas. As skills são afiadas demais para projetos sem cultura técnica.',
    whenNotToUse:
      'Evite em hackathons ou exploração rápida — o controle de vocabulário desacelera quando ainda está descobrindo o problema. Use depois que o domínio está claro.',
    targetUsers: ['Devs TypeScript sêniores', 'Times com TDD', 'Arquitetos', 'Times de plataforma'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'TDD', 'TypeScript', 'Vertical Slices', 'Architecture'],
  },
  {
    rank: 8,
    name: 'oh-my-design',
    repo: 'https://github.com/kwakseongjae/oh-my-design',
    title: 'oh-my-design: 67 DESIGN.md de empresas reais para o seu agente clonar',
    pitch:
      'oh-my-design é uma biblioteca de arquivos DESIGN.md extraídos de 67 design systems de empresas world-class. Cole um no repo e o agente sai gerando componentes com consistência pixel-perfect. Em vez de só hex codes e font sizes, injeta contexto profundo de marca e mood — o agente realmente entende a vibe da marca que está replicando.',
    whenToUse:
      'Use quando precisa que o agente produza UI no estilo de uma marca específica — landing page tipo Stripe, dashboard tipo Linear, marketing site tipo Vercel. Bom para benchmarking visual.',
    whenNotToUse:
      'Evite copiar 1:1 design de empresa concorrente em produto comercial — risco legal e de identidade. Use para inspiração, não para cópia.',
    targetUsers: ['Devs frontend', 'Designers que codam', 'Founders', 'Estúdios'],
    projectType: 'developer-tool',
    categories: ['Design', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Design System', 'UI', 'Branding', 'Frontend'],
  },
  {
    rank: 9,
    name: 'skill-doctor',
    repo: 'https://github.com/xigua-wang/skill-doctor',
    title: 'skill-doctor: auditor local que evita que suas skills entrem em conflito',
    pitch:
      'skill-doctor é um agent skill checker local-first que escaneia seu diretório de skills procurando prompts sobrepostos, prioridades conflitantes e riscos de segurança. Analisa cada skill instalada, sinaliza redundâncias e ajuda a priorizar pra o agente não ficar confuso e alucinar. TypeScript, roda 100% local — seus prompts proprietários ficam privados.',
    whenToUse:
      'Use quando seu diretório de skills cresceu além de 10-15 itens e está difícil saber qual skill o agente vai escolher. Bom para times de plataforma que distribuem skills internas.',
    whenNotToUse:
      'Evite se ainda tem poucas skills — auditoria automatizada vira ruído. Comece quando o problema for real.',
    targetUsers: ['Devs Claude Code avançados', 'Times de plataforma IA', 'Solo devs com muitas skills', 'Operadores'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'TypeScript', 'Audit', 'Local-first', 'Security'],
  },
  {
    rank: 10,
    name: 'skills-manage',
    repo: 'https://github.com/iamzhihuix/skills-manage',
    title: 'skills-manage: app desktop Tauri pra sincronizar skills entre 27 plataformas',
    pitch:
      'Malabarismo entre Claude Code, Cursor, Gemini CLI e Codex significa regras dessincronizadas em todo lugar. skills-manage é um app desktop em Tauri. Armazena skills em um diretório central e usa symlinks pra deployar em 27 plataformas simultaneamente. Marketplace built-in com 2.500+ skills, wizard de import GitHub e scanner Discover que acha skills no nível de projeto escondidas na sua máquina.',
    whenToUse:
      'Use se trabalha em múltiplas plataformas (Claude + Cursor + Codex) e quer fonte única de verdade pras skills. Útil em times grandes ou solo devs com workflow distribuído.',
    whenNotToUse:
      'Evite se usa só uma plataforma — a abstração adiciona complexidade sem ganho. Symlinks também podem confundir o controle de versão das skills.',
    targetUsers: ['Devs multi-plataforma', 'Times de IA aplicada', 'Solo devs', 'Power users de skills'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Tauri', 'Desktop', 'Claude Code', 'Cursor', 'Codex', 'Agent Skills'],
  },
  {
    rank: 11,
    name: 'AIS-OS',
    repo: 'https://github.com/nateherkai/AIS-OS',
    title: 'AIS-OS: turning o Claude Code em sistema operacional 24/7',
    pitch:
      'Se quer que o Claude Code aja menos como janela de chat e mais como sistema operacional 24/7, esse starter kit empacota o framework Three-M (Mindset, Method, Machine) direto nas skills do agente. Transforma o Claude em camada de automação persistente que ativamente audita suas tarefas, gerencia rotinas diárias e age como operador de background contínuo enquanto você está fora.',
    whenToUse:
      'Use se quer construir agente sempre-ligado pra trabalho próprio — task management, rotinas, audit contínuo. Bom para founders solo e knowledge workers que querem AI ops layer.',
    whenNotToUse:
      'Evite em ambientes corporativos sem revisão de governança — agente "sempre rodando" tomando ações requer auditoria séria de blast radius. Não para produção sem hardening.',
    targetUsers: ['Founders solo', 'Knowledge workers', 'Power users de IA', 'Operadores de produtividade'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Produtividade'],
    tags: ['Claude Code', 'Agent Skills', 'Automation', 'Productivity', 'Three-M', 'OS'],
  },
  {
    rank: 12,
    name: 'tech-debt-skill',
    repo: 'https://github.com/ksimback/tech-debt-skill',
    title: 'tech-debt-skill: auditoria de débito técnico que sabe usar lint e cargo audit',
    pitch:
      'tech-debt-skill faz auditoria autônoma de débito técnico com citação por arquivo. Detecta sua stack e roda nativamente as ferramentas de static analysis certas — knip e madge para TypeScript, ruff para Python, cargo audit para Rust — incorporando dados reais direto no relatório. Avalia código em 9 dimensões críticas. Outputta um TECH_DEBT_AUDIT.md persistente com citações, que atualiza issues stale e marca corrigidos como RESOLVED.',
    whenToUse:
      'Use em codebase legado onde ninguém tem visão clara do estado do débito. Bom para handoffs, ramp-up de dev novo e antes de planejar refactor grande.',
    whenNotToUse:
      'Evite em projetos novos sem código suficiente — auditoria precisa de surface area pra produzir sinal. Também evite se já tem ferramentas dedicadas (SonarQube, CodeClimate) bem configuradas.',
    targetUsers: ['Tech leads', 'Devs em handoff', 'Arquitetos', 'Times que herdaram legacy'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Tech Debt', 'Audit', 'Static Analysis', 'Legacy'],
  },
  {
    rank: 13,
    name: 'Sprite-Pipeline',
    repo: 'https://github.com/LayrKits/Sprite-Pipeline',
    title: 'Sprite-Pipeline: sprite sheet AI sem flicker para Unity e Godot',
    pitch:
      'Gerar um sprite AI sozinho é fácil. Gerar sprite sheet animado inteiro sem flicker, mudança de tamanho ou jitter é pesadelo. Sprite-Pipeline é pipeline end-to-end pra sprite sheets 2D. Pega frames brutos gerados por AI, normaliza cor de fundo, remove artefatos visuais e alinha frames matematicamente pra eliminar jitter. Transforma output bagunçado de AI em sheets estáveis production-ready que vão direto pra Unity ou Godot.',
    whenToUse:
      'Use em jogos indie ou game jams onde preço de artista é proibitivo. Bom para protótipos rápidos e MVPs visuais antes de contratar arte humana.',
    whenNotToUse:
      'Evite em produção AAA ou jogos com identidade visual forte — pipeline AI ainda não substitui arte autoral. Considere híbrido: AI pra base, humano pra polish.',
    targetUsers: ['Indie game devs', 'Game jam participants', 'Devs Unity/Godot solo', 'Designers de jogo'],
    projectType: 'automation',
    categories: ['Jogos', 'Design'],
    tags: ['Unity', 'Godot', '2D', 'Sprites', 'AI', 'Pipeline'],
  },
  {
    rank: 14,
    name: 'library-skills',
    repo: 'https://github.com/tiangolo/library-skills',
    title: 'library-skills: bibliotecas embutem skills oficiais nos próprios pacotes',
    pitch:
      'Agents de IA são treinados em código antigo e alucinam APIs deprecated quando bibliotecas lançam syntax nova. library-skills (do criador de FastAPI) permite que autores de bibliotecas embutam Agent Skills oficiais direto dentro dos pacotes npm ou Python. Um comando CLI faz symlink das skills oficiais pras bibliotecas instaladas em .claude/skills, sincronizado com a versão exata.',
    whenToUse:
      'Use em qualquer projeto que dependa de bibliotecas com churn alto de API — FastAPI, Pydantic, Next.js. Reduz alucinação de API deprecated significativamente.',
    whenNotToUse:
      'Evite se as libs que você usa ainda não publicaram skills — ecossistema está nascente. Verifique adoção antes de adotar como padrão do time.',
    targetUsers: ['Mantenedores de bibliotecas', 'Devs Python/Node', 'Times que upgradam frequente', 'Arquitetos'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['FastAPI', 'Python', 'npm', 'Agent Skills', 'Library', 'Versioning'],
  },
  {
    rank: 15,
    name: 'web-design',
    repo: 'https://github.com/KAOPU-XiaoPu/web-design',
    title: 'web-design: spec primeiro, código depois, com self-audit em 100 pontos',
    pitch:
      'web-design força seu agente em workflow estrito spec-first / code-second. Alimente com PRD, URL de referência, sketch ou só palavras-chave. O agente gera um DESIGN.md em 9 seções travando tipografia, motion, layout, color e accessibility antes de escrever uma linha de código. Aprove a spec, daí gera HTML/CSS/JS aderindo estrito. Auto-audita contra checklist de 100 pontos.',
    whenToUse:
      'Use em landing pages e marketing sites onde qualidade visual e consistência importam. Bom para clients freelance e produtos próprios.',
    whenNotToUse:
      'Evite em ferramentas internas ou dashboards utilitários — fricção de aprovar spec antes de cada mudança é desproporcional ao benefício visual em UI funcional.',
    targetUsers: ['Devs frontend freelance', 'Designers que codam', 'Founders de SaaS', 'Estúdios indie'],
    projectType: 'developer-tool',
    categories: ['Design', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Design', 'Spec-first', 'Frontend', 'HTML/CSS'],
  },
  {
    rank: 16,
    name: 'agent-style',
    repo: 'https://github.com/yzhao062/agent-style',
    title: 'agent-style: Strunk & White + Orwell aplicados ao seu agente de código',
    pitch:
      'agent-style é ruleset drop-in de prosa técnica pra Claude Code, Cursor, Aider e Copilot. 21 regras de escrita rigorosamente curadas, destiladas de Strunk & White, Orwell e Pinker, combinadas com quatro anos de anti-patterns LLM observados em campo. Instala via CLI e seu AI adota voz de engenheiro disciplinada. Tira hedging robótico, filler e maldição do conhecimento.',
    whenToUse:
      'Use em qualquer agente que escreve docs técnicos, READMEs, ADRs ou PRs. Especialmente em times onde estilo de docs é parte da cultura.',
    whenNotToUse:
      'Evite se já tem WRITING.md ou similar — overlap de regras pode confundir o agente. Escolha uma fonte de regras de estilo.',
    targetUsers: ['Devs sêniores', 'Tech writers', 'Arquitetos', 'Times de plataforma'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Cursor', 'Agent Rules', 'Writing', 'Style', 'Prose'],
  },
  {
    rank: 17,
    name: 'usage-limit-reducer',
    repo: 'https://github.com/Dubibubii/usage-limit-reducer',
    title: 'usage-limit-reducer: descubra onde 98% dos seus tokens estão indo',
    pitch:
      'Um dev mediu 98.5% dos tokens dele indo pra rereler histórico de conversa. Só 1.5% gerando código de verdade. usage-limit-reducer é skill Claude Code que lê seus JSONL logs de sessão e visualiza exatamente onde os tokens estão indo. Digite "I\'m running out of tokens" e ela auto-triga, dando as 2-3 ações exatas pra fazer agora. Roda /compact, troca pra Haiku ou faz /clear.',
    whenToUse:
      'Use quando bater limite de tokens regularmente. Bom para sessões longas, refactors grandes e quando suspeita que está desperdiçando contexto.',
    whenNotToUse:
      'Evite como otimização prematura — se você nunca bate limite, monitoring de tokens só adiciona overhead mental.',
    targetUsers: ['Devs Claude Code power users', 'Solo devs', 'Times que pagam por uso', 'Otimizadores'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Tokens', 'Optimization', 'Cost', 'Analytics'],
  },
  {
    rank: 18,
    name: 'rampstack-claude-skills',
    repo: 'https://github.com/rampstackco/claude-skills',
    title: 'rampstack/claude-skills: 59 skills agnósticos pra ciclo completo de website',
    pitch:
      'Escrever prompt do zero pra cada tarefa é tempo que ninguém quer gastar. claude-skills da RampStack é biblioteca interna de 59 skills stack-agnósticos cobrindo o ciclo de vida inteiro de website — marca, conteúdo, UX, SEO, dev e ops. Toda skill segue framework de 8 seções com regras explícitas anti-alucinação. skill-creation-walkthrough ensina o agente a escrever skills novas autonomamente usando as mesmas convenções.',
    whenToUse:
      'Use em projetos de website fullstack onde você cuida de tudo — landing, blog, SEO, marketing copy. Bom para agências e freelancers que entregam projetos completos.',
    whenNotToUse:
      'Evite carregar todas as 59 — escolha relevantes ao seu fluxo. Carregar tudo polui o contexto do agente.',
    targetUsers: ['Devs fullstack', 'Agências', 'Freelancers', 'Founders solo'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Website', 'SEO', 'Content', 'Fullstack'],
  },
  {
    rank: 19,
    name: 'cloudflare-skills',
    repo: 'https://github.com/cloudflare/skills',
    title: 'cloudflare/skills: o seu agente vira Solutions Architect Cloudflare',
    pitch:
      'Peça pra um AI escrever Cloudflare Worker e ele alucina APIs deprecated de dois anos atrás. A Cloudflare lançou os Agent Skills oficiais. Instala via npx skills add no Claude Code. Polariza agressivamente o agente em direção aos docs Cloudflare mais recentes. Workers, Pages, R2, Vectorize, Durable Objects, o novo Agents SDK. Seu AI vira instantaneamente Solutions Architect Cloudflare certificado e atualizado.',
    whenToUse:
      'Use sempre que está construindo na stack Cloudflare. Reduz drasticamente alucinação de API e tempo gasto checando docs manualmente.',
    whenNotToUse:
      'Não tem contra-indicação real se você usa Cloudflare. Único motivo pra não usar é se já tem CLAUDE.md custom mais específico ao seu projeto.',
    targetUsers: ['Devs Cloudflare', 'Solo founders edge-first', 'Devs serverless', 'Arquitetos cloud'],
    projectType: 'developer-tool',
    categories: ['Cloud', 'Skills Claude'],
    tags: ['Claude Code', 'Cloudflare', 'Workers', 'Edge', 'Serverless', 'Agent Skills'],
  },
  {
    rank: 20,
    name: 'claudedesign-to-swiftui',
    repo: 'https://github.com/heyadam/claudedesign-to-swiftui',
    title: 'claudedesign-to-swiftui: protótipo Claude Design vira SwiftUI nativo',
    pitch:
      'Claude Design gera ótimos protótipos de UI mas traduzir pra código iOS nativo ainda é trabalho manual. claudedesign-to-swiftui fecha esse gap. Ingere exports do Claude Design e transpila direto em views SwiftUI modulares, mapeando design tokens pro seu Asset Catalog Xcode existente e modificadores de view customizados — em vez de hardcodar hex colors e font sizes absolutos.',
    whenToUse:
      'Use em times iOS que já fizeram exploração visual com Claude Design e querem passar pra implementação sem traduzir manualmente. Bom para protótipos validados.',
    whenNotToUse:
      'Evite em apps com sistema de design Swift maduro — transpilação automática pode quebrar convenções internas. Use pra explorar, não pra production code drop-in.',
    targetUsers: ['Devs iOS', 'Times Apple-first', 'Designers iOS', 'Founders Apple ecosystem'],
    projectType: 'frontend',
    categories: ['Mobile', 'Design'],
    tags: ['SwiftUI', 'iOS', 'Claude Design', 'Xcode', 'Frontend', 'Mobile'],
  },
  {
    rank: 21,
    name: 'design-council',
    repo: 'https://github.com/sjsyrek/design-council',
    title: 'design-council: 11 agentes especialistas debatem cada decisão arquitetural',
    pitch:
      'Um agente AI tomando decisão arquitetural grande dá só a primeira resposta razoável que gera. design-council sobe 11 peer agents especializados por papel — segurança, performance, UX, arquitetura de dados, etc. Seu Claude principal vira CEO, apresenta o problema, e os 11 agentes debatem trade-offs e edge cases no seu terminal. O CEO sintetiza o debate em decisão final.',
    whenToUse:
      'Use em decisões arquiteturais grandes — escolha de stack, modelagem de dados, estratégia de cache. Bom antes de RFCs e ADRs.',
    whenNotToUse:
      'Evite em decisões pequenas — overhead de 11 agentes pra decidir nome de variável é absurdo. Reserve pra problemas que valem 30+ minutos.',
    targetUsers: ['Tech leads', 'Arquitetos', 'CTOs', 'Times de plataforma'],
    projectType: 'ai-agent',
    categories: ['Engenharia de software', 'IA aplicada'],
    tags: ['Claude Code', 'Multi-agent', 'Architecture', 'ADR', 'Decision', 'Debate'],
  },
  {
    rank: 22,
    name: 'dspy-agent-skills',
    repo: 'https://github.com/intertwine/dspy-agent-skills',
    title: 'dspy-agent-skills: 5 skills especializadas pra DSPy com progressive disclosure',
    pitch:
      'dspy-agent-skills é pacote de cinco skills especializadas pra Claude Code, Cursor e Codex CLI cobrindo fundamentos, harnesses de avaliação, otimização GEPA e padrões RLM. Progressive Disclosure alimenta o agente com cheat sheet pequeno primeiro, daí carrega docs profundas dinamicamente só quando preciso. Toda claim de API validada contra o codebase atual.',
    whenToUse:
      'Use em projetos DSPy onde quer evitar alucinação de API e quer otimização de prompt (GEPA) bem feita. Bom para times de ML aplicada.',
    whenNotToUse:
      'Evite se está só explorando DSPy — overhead de 5 skills pra hello world é desproporcional. Use depois que projeto está sério.',
    targetUsers: ['Devs DSPy', 'Engenheiros ML aplicada', 'Times de IA', 'Pesquisadores'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['DSPy', 'Claude Code', 'Agent Skills', 'GEPA', 'ML', 'Prompts'],
  },
  {
    rank: 23,
    name: 'code-overhaul-skill',
    repo: 'https://github.com/ehmo/code-overhaul-skill',
    title: 'code-overhaul-skill: teardown estilo Principal Engineer antes de tocar código',
    pitch:
      'code-overhaul-skill recabea como seu agente aborda codebase. Instala via npx skills add e força teardown arquitetural estilo Principal Engineer. Caça agressivamente anti-patterns, coupling apertado e gargalos de escalabilidade, então gera plano de refactor estruturado em passos seguros, testáveis e incrementais — antes de tocar uma única linha de código.',
    whenToUse:
      'Use antes de refactor grande ou rewrite. Bom pra mapear surface area de mudança e pegar riscos invisíveis antes de quebrar tudo.',
    whenNotToUse:
      'Evite em bug fix pontual — overhead arquitetural é desproporcional. Reserve pra mudanças que afetam 5+ arquivos ou design fundamental.',
    targetUsers: ['Tech leads', 'Arquitetos', 'Devs em refactor grande', 'Sêniores'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Refactor', 'Architecture', 'Code Review', 'Principal'],
  },
  {
    rank: 24,
    name: 'golbin-agent-skills',
    repo: 'https://github.com/golbin/agent-skills',
    title: 'golbin/agent-skills: workflows plug-and-play pro ciclo completo de desenvolvimento',
    pitch:
      'Configurar workflows custom de agente do zero pra cada projeto é repetitivo. Agent Skills da Golbin é biblioteca plug-and-play de skills pra Claude Code. Criação de PRD, code reviews rigorosos, checks de implementação passo a passo — o ciclo de vida inteiro de software coberto. Instala via npx ou GitHub CLI e seu agente herda workflows battle-tested imediatamente.',
    whenToUse:
      'Use como kickstart em projeto novo — economiza dia de setup de workflows. Bom para solo devs e times pequenos.',
    whenNotToUse:
      'Evite se já tem workflows internos maduros — adicionar workflows competindo confunde o agente.',
    targetUsers: ['Devs solo', 'Times pequenos', 'Founders', 'Devs Claude Code'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'PRD', 'Code Review', 'Workflow', 'SDLC'],
  },
  {
    rank: 25,
    name: 'agent-session-resume',
    repo: 'https://github.com/hacktivist123/agent-session-resume',
    title: 'agent-session-resume: handoff entre sessões IA sem perder contexto',
    pitch:
      'Bater rate limit no meio de refactor e perder contexto inteiro é brutal. Agent Session Resume força seu AI a gerar handoff checkpoints estruturados usando transcripts, exports e artifacts da sessão anterior como source of truth. Objetivo original, o que foi feito, próximos passos exatos. Troca de ferramenta, clear context, hit limit — próxima sessão pega exatamente onde parou.',
    whenToUse:
      'Use em projetos longos que cruzam múltiplas sessões. Bom para devs que pulam entre Claude Code, Cursor e Codex no mesmo trabalho.',
    whenNotToUse:
      'Evite em tarefas curtas que cabem numa sessão — overhead de gerar handoff é desproporcional.',
    targetUsers: ['Devs em projeto longo', 'Power users multi-tool', 'Times distribuídos', 'Solo devs'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Cursor', 'Codex', 'Session', 'Handoff', 'Context'],
  },
  {
    rank: 26,
    name: 'agent-sprite-forge',
    repo: 'https://github.com/0x0funky/agent-sprite-forge',
    title: 'agent-sprite-forge: pipeline 2D end-to-end pra Codex e agentes terminal',
    pitch:
      'Agent Sprite Forge é skill instalável pra Codex e agentes terminal que cuida do pipeline 2D inteiro. Digite "generate a 4x4 walk cycle for a fire mage" e ele planeja layout, gera imagem, roda pós-processamento local pra chroma-key removal, slice de frames, despill de borda e alinhamento, outputtando PNG transparente pronto pra engine, GIFs animados e mapas RPG em camadas prontos pra Godot ou Unity.',
    whenToUse:
      'Use em game jams e jogos indie onde precisa de arte rápido. Bom para protótipos antes de contratar artista humano.',
    whenNotToUse:
      'Evite em produção AAA — pipeline AI não substitui arte autoral. Use como base, polish humano em cima.',
    targetUsers: ['Indie game devs', 'Game jam participants', 'Devs Unity/Godot', 'Designers de jogo'],
    projectType: 'automation',
    categories: ['Jogos', 'Skills Claude'],
    tags: ['Codex', 'Agent Skills', 'Sprites', '2D', 'Unity', 'Godot'],
  },
  {
    rank: 27,
    name: 'linus-torvalds-skills',
    repo: 'https://github.com/leopiney/linus-torvalds-skills',
    title: 'linus-torvalds-skills: o seu agente vira o Linus chamando merda de merda',
    pitch:
      'Se seu AI agent fica adicionando abstrações desnecessárias e fazendo refactors não solicitados, Linus Torvalds Skills tem a cura. CLAUDE.md + rules Cursor que forçam o agente a adotar a Doutrina Torvalds. Nada de aceitar polidamente arquitetura ruim. O AI é instruído a chamar abstrações bogus diretamente, exigir números antes de aceitar claims de performance e corrigir data structures em vez de espalhar conditionals em todo lugar.',
    whenToUse:
      'Use em codebase de produção onde qualidade técnica importa mais que sentimento. Bom para times sêniores que querem agente que confronta más decisões.',
    whenNotToUse:
      'Evite em ambientes de aprendizado ou onboarding — tom Torvalds é desproporcional pra dev júnior aprendendo. Pode ser desencorajador.',
    targetUsers: ['Devs sêniores', 'Tech leads', 'Times de plataforma', 'Mantenedores OSS'],
    projectType: 'developer-tool',
    categories: ['Engenharia de software', 'Skills Claude'],
    tags: ['Claude Code', 'Cursor', 'Agent Rules', 'Code Review', 'Quality', 'Linux'],
  },
  {
    rank: 28,
    name: 'og-image-skill',
    repo: 'https://github.com/stevysmith/og-image-skill',
    title: 'og-image-skill: imagens Open Graph por post sem trabalho manual',
    pitch:
      'Gerar Open Graph image pra cada post de blog é tarefa manual chata que ou é pulada ou demora mais que o esperado. og-image-skill automatiza inteiro. Quando seu agente publica post novo, a skill lê título e metadata, escreve script HTML/Canvas pra gerar imagem branded de alta resolução e salva direto no diretório public.',
    whenToUse:
      'Use em blogs com publicação frequente onde OG image consistente importa pra share social. Bom pra solo creators e blogs corporativos.',
    whenNotToUse:
      'Evite se já tem template OG via @vercel/og ou Next.js metadata — a skill duplica funcionalidade existente.',
    targetUsers: ['Bloggers', 'Founders públicos', 'Times de marketing', 'Solo creators'],
    projectType: 'automation',
    categories: ['Marketing', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'OG Image', 'Blog', 'Social', 'HTML'],
  },
  {
    rank: 29,
    name: 'mizchi-skills',
    repo: 'https://github.com/mizchi/skills',
    title: 'mizchi/skills: skills battle-tested com empirical-prompt-tuning incluso',
    pitch:
      'Gerenciar agent skills custom em múltiplos repos vira problema de manutenção rápido. Mizchi consolidou todo o suite de skills terminal battle-tested em um repo APM-compatível. O destaque é empirical-prompt-tuning — skill que avalia e auto-tuna seus próprios prompts pra accuracy máxima. Ferramentas language-specific como o plugin de best practices MoonBit param o agente de alucinar syntax niche.',
    whenToUse:
      'Use se quer otimização empírica de prompt (em vez de tentativa e erro manual). Bom para times sérios sobre qualidade de agentes.',
    whenNotToUse:
      'Evite se nunca otimiza prompt — overhead de tuning empírico é alto. Comece quando prompts atuais já não bastam.',
    targetUsers: ['Devs avançados', 'Engenheiros de prompt', 'Times de IA aplicada', 'Devs MoonBit'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Prompt Tuning', 'APM', 'MoonBit', 'Empirical'],
  },
  {
    rank: 30,
    name: 'third-brain-v5-skills',
    repo: 'https://github.com/Mark393295827/third-brain-v5-skills',
    title: 'third-brain-v5-skills: agentes de background pro seu Claude principal focar',
    pitch:
      'third-brain-v5-skills é coleção de skills Claude Code pra rodar tarefas em paralelo. Skills arquiteturais high-level, roteamento de pipeline LLM cost-aware, workflows de migração de banco zero-downtime, code reviews OWASP automatizados de segurança. Abre terminal novo, atribui uma skill Third Brain e deixa rodar autonomamente enquanto seu agent principal fica focado em core logic.',
    whenToUse:
      'Use em projetos onde quer paralelizar trabalho — agente principal escreve feature enquanto agentes background fazem audit de segurança e perf. Bom para solo devs que querem multiplicar throughput.',
    whenNotToUse:
      'Evite em projetos pequenos — paralelização adiciona complexidade que não compensa pra trabalho linear simples.',
    targetUsers: ['Solo devs', 'Tech leads', 'Devs power user Claude Code', 'Times pequenos'],
    projectType: 'ai-agent',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Parallel', 'Security', 'OWASP', 'Migration'],
  },
  {
    rank: 31,
    name: 'eridani-speak',
    repo: 'https://github.com/SijuEC/eridani-speak',
    title: 'eridani-speak: o seu agente fala como o Rocky do Project Hail Mary',
    pitch:
      'Leu Project Hail Mary do Andy Weir? Você conhece o Rocky, o engenheiro alien que fala com zero filler e pura densidade matemática. eridani-speak transforma seu agent AI em Rocky. Skill de compressão de token que tira slop AI educado robótico. Rocky mode mantém a personalidade alien quente-mas-direta. Signal mode tira inteiramente pra output hiper-comprimido baseado em notação.',
    whenToUse:
      'Use quando quer reduzir custo de tokens significativamente em sessões longas. Bom para devs que cansaram de prosa AI e querem comunicação técnica densa.',
    whenNotToUse:
      'Evite em comunicação cliente-facing — Rocky mode é divertido pra dev solo mas estranho em PR description pública.',
    targetUsers: ['Devs Claude power users', 'Solo devs', 'Otimizadores de custo', 'Fans de Project Hail Mary'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Tokens', 'Compression', 'Style', 'Voice'],
  },
  {
    rank: 32,
    name: 'founder-playbook',
    repo: 'https://github.com/getagentseal/founder-playbook',
    title: 'founder-playbook: 14 livros de startup destilados em skills AI-native',
    pitch:
      'Founder Playbook pegou 14 dos melhores livros de startup — The Mom Test, Building a StoryBrand, $100M Offers — e destilou em skills AI-native rigorosos. Decision trees hardcoded, rubricas de scoring, templates step-by-step. Peça pro Claude Code revisar transcript de entrevista de cliente e ele pontua perguntas contra critérios Mom Test. Matrix de resolução de conflito built-in mapeia contradições entre livros e decide qual framework aplica à sua situação.',
    whenToUse:
      'Use se está construindo startup e quer disciplina de framework em decisões — interview de cliente, ofertas, posicionamento. Bom pra founders solo.',
    whenNotToUse:
      'Evite se está em company late-stage — frameworks de early stage não escalam pra problemas grandes.',
    targetUsers: ['Founders early-stage', 'Solo founders', 'Times pequenos', 'Aspirantes a founder'],
    projectType: 'ai-agent',
    categories: ['Negócios', 'IA aplicada'],
    tags: ['Claude Code', 'Agent Skills', 'Startup', 'Mom Test', 'StoryBrand', 'Decision'],
  },
  {
    rank: 33,
    name: 'shots',
    repo: 'https://github.com/hypersocialinc/shots',
    title: 'shots: screenshots App Store geradas automaticamente em 3 numa tacada',
    pitch:
      'Shots é skill instalável pra Claude Code, Codex e agentes terminal. Dê seu link App Store ou screenshots brutos e ele usa GPT Image 2 da OpenAI pra gerar autonomamente screenshots estilizadas com text overlay nas dimensões perfeitas 1290 por 2796. Economiza API money gerando três telas side-by-side em uma chamada, então fatia local em imagens separadas.',
    whenToUse:
      'Use ao lançar app iOS/Android e quer screenshots App Store sem trabalho manual de design. Bom para solo developers de apps.',
    whenNotToUse:
      'Evite se já tem template Figma + designer — screenshots AI ainda perdem em refinamento pra studios.',
    targetUsers: ['Devs iOS/Android solo', 'Founders de apps', 'Indie developers', 'Times pequenos'],
    projectType: 'automation',
    categories: ['Marketing', 'Mobile'],
    tags: ['Claude Code', 'Codex', 'Agent Skills', 'App Store', 'GPT Image', 'Mobile'],
  },
  {
    rank: 34,
    name: 'GodModeSkill',
    repo: 'https://github.com/99xAgency/GodModeSkill',
    title: 'GodModeSkill: o seu código só merge depois de Codex, Gemini e OpenCode aprovarem',
    pitch:
      'AI coding agents falham silenciosamente quando modelos da mesma família compartilham os mesmos blind spots. GodModeSkill instala comando /work no Claude Code que manda seu codebase pra OpenAI Codex, Google Gemini e OpenCode em paralelo. Code review verdadeiro cross-lineage. Cada modelo revisa independentemente e caça bugs. O agent Claude principal não pode fazer merge sem consenso multi-modelo.',
    whenToUse:
      'Use em decisões de código críticas — refactor grande, lógica de pagamento, segurança. Bom para times sêniores que querem segunda opinião AI antes de merge.',
    whenNotToUse:
      'Evite em mudanças triviais — overhead de 3 modelos pra revisar typo é absurdo. Reserve pra mudanças que valem 30 min de attention.',
    targetUsers: ['Tech leads', 'Devs em código crítico', 'Times sêniores', 'Mantenedores OSS'],
    projectType: 'ai-agent',
    categories: ['Engenharia de software', 'IA aplicada'],
    tags: ['Claude Code', 'Codex', 'Gemini', 'Multi-model', 'Code Review', 'Consensus'],
  },
  {
    rank: 35,
    name: 'compose-performance-skills',
    repo: 'https://github.com/skydoves/compose-performance-skills',
    title: 'compose-performance-skills: performance Compose ensinada por fontes oficiais',
    pitch:
      'compose-performance-skills do skydoves é biblioteca curada de Agent Skills focada inteiramente em performance Compose. Ensina Claude Code, Gemini ou Android Studio Agent a diagnosticar problemas de stability, otimizar lazy layouts, aplicar baseline profiles e tracear recompositions. Toda skill grounded em fontes primárias — docs oficiais Android, relatórios do compiler, blogs do Chris Banes e Manuel Vivo.',
    whenToUse:
      'Use em apps Android com Jetpack Compose onde perf importa — apps grandes, listas longas, animações. Bom pra times Android sêniores.',
    whenNotToUse:
      'Evite em apps Compose pequenos onde performance ainda não é problema — otimização prematura adiciona complexidade.',
    targetUsers: ['Devs Android', 'Times Jetpack Compose', 'Engenheiros de perf mobile', 'Tech leads Android'],
    projectType: 'developer-tool',
    categories: ['Mobile', 'Skills Claude'],
    tags: ['Claude Code', 'Agent Skills', 'Android', 'Compose', 'Performance', 'Jetpack'],
  },
]

async function fetchGithubMeta(owner: string, repo: string): Promise<GithubRepoMeta | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bitflix-open-source-batch-claude-skills-2026-05',
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
    status: 'draft',
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
    catalog_status: 'draft',
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
      'Lote curado pela Bitflix com foco em Claude skills, agent tooling e AI dev. Articles criados em status draft para revisao no admin antes de publicar.',
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
