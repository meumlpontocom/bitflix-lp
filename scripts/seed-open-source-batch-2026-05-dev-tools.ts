/**
 * Seed idempotente do batch Bitflix open source — Dev tools & AI agents maio/2026 (35 projetos).
 *
 * Cria 35 Articles + 35 OpenSourceCatalogEntry linkados, JA em status `published`
 * (catalog_status=published), com metadados publicos do GitHub. Curadoria propria Bitflix,
 * foco em dev tools, coding agents, CLIs, infra, seguranca e AI tooling.
 *
 * User pediu publicacao DIRETA nesta rodada (parity weekly-31). Sem etapa de revisao no admin.
 * Sem revalidatePath porque (site)/* usa dynamic='force-dynamic' (memoria feedback_site_pages_dynamic).
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-open-source-batch-2026-05-dev-tools.ts
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
const DISCOVERY_SOURCE_NAME = 'Curadoria Bitflix — Dev tools & AI agents maio/2026'

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
    name: 'AI-Engineering-Coach',
    repo: 'https://github.com/microsoft/AI-Engineering-Coach',
    title: 'AI Engineering Coach: a Microsoft te dá feedback sobre como você usa IA pra codar',
    pitch:
      'Usar ferramentas de IA o dia inteiro sem nunca saber se o seu prompting está melhorando é a norma para quase todo dev. AI Engineering Coach é uma extensão de VS Code da Microsoft que lê os logs locais das suas sessões de IA no Claude, Codex e Xcode e transforma tudo em insight acionável. Acompanha sua pontuação de prática ao longo do tempo e sinaliza prompts que você repete com frequência suficiente para virar skills reutilizáveis.',
    whenToUse:
      'Use quando quer evoluir de forma deliberada no uso de coding agents — medir, comparar e identificar padrões repetidos que merecem virar skill. Bom para devs solo querendo subir de nível e times que querem padronizar prática de IA.',
    whenNotToUse:
      'Evite se os logs de sessão contêm contexto sensível de cliente sem revisão de privacidade. A leitura é local, mas vale conferir o que entra na análise antes de adotar em time.',
    targetUsers: ['Devs que usam coding agents', 'Times de engenharia', 'Tech leads', 'Quem quer melhorar prompting'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['VS Code', 'Claude', 'Codex', 'Xcode', 'Prompting', 'Microsoft'],
  },
  {
    rank: 2,
    name: 'AIPointer',
    repo: 'https://github.com/gonemedia/aipointer',
    title: 'AIPointer: aponte o mouse pra qualquer coisa na tela e pergunte pra IA',
    pitch:
      'O Magic Pointer do Google é só para Chromebook. AIPointer traz a ideia para qualquer sistema operacional. Mexa o mouse ou aperte um atalho e um overlay glassmorphism aparece ao lado do cursor. Ele tira print do que você está apontando e manda para um modelo de visão. Digite ou fale sua pergunta em uma de sete línguas e receba a resposta sem trocar de aba nem copiar nada. Traga sua própria chave: Anthropic, OpenAI ou Gemini.',
    whenToUse:
      'Use quando quer respostas contextuais sobre o que está na tela sem interromper o fluxo — analisar um gráfico, entender um erro, traduzir um trecho. Bom para quem vive entre apps e cansou de print + colar no chat.',
    whenNotToUse:
      'Evite apontar para dados confidenciais sem cuidado — o screenshot vai para o provedor de visão escolhido. Confira política de retenção do provedor antes de usar em tela com PII.',
    targetUsers: ['Power users de IA', 'Analistas', 'Devs', 'Quem trabalha multi-app'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['Vision', 'Overlay', 'Anthropic', 'OpenAI', 'Gemini', 'Produtividade'],
  },
  {
    rank: 3,
    name: 'rmux',
    repo: 'https://github.com/Helvesec/rmux',
    title: 'rmux: deixa seu agente de IA pilotar qualquer app de terminal por código',
    pitch:
      'Agentes de código precisam dirigir apps de terminal, mas a maioria das CLIs nunca foi feita para controle programático. rmux é um multiplexador universal em Rust com um SDK tipado que deixa você spawnar, ler, escrever e controlar qualquer app CLI ou TUI a partir de código. Nativo em Linux, macOS e Windows, sem depender de tmux ou screen. Seu agente pode pilotar htop, vim, psql ou qualquer programa de terminal como se tivesse mãos.',
    whenToUse:
      'Use quando está construindo um agente que precisa operar ferramentas interativas de terminal de forma confiável e cross-platform. Bom para automação de DevOps, testes de TUI e harnesses de coding agent.',
    whenNotToUse:
      'Evite se sua automação só roda comandos não-interativos — aí um simples exec resolve sem a complexidade de um multiplexador.',
    targetUsers: ['Devs de agentes de IA', 'Engenheiros de automação', 'Devs Rust', 'Times de DevOps'],
    projectType: 'developer-tool',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Rust', 'CLI', 'TUI', 'SDK', 'Automação', 'Terminal'],
  },
  {
    rank: 4,
    name: 'Photo-agents',
    repo: 'https://github.com/jmerelnyc/Photo-agents',
    title: 'Photo-agents: o agente computer-use que escreve as próprias skills enquanto aprende',
    pitch:
      'A maioria dos agentes de computer-use começa do zero a cada sessão. Photo-agents foi feito para de fato aprender. É um framework de agente autônomo e auto-evolutivo que usa memória em camadas ancorada em visão, então enxerga sua tela do jeito que um humano enxergaria. A parte interessante: ele escreve as próprias skills. Toda vez que completa uma tarefa com sucesso, codifica esse conhecimento e reutiliza na próxima. Fica melhor quanto mais você roda.',
    whenToUse:
      'Use em pesquisa de agentes autônomos e automação de tarefas repetitivas de tela onde a melhoria contínua compensa. Bom para experimentos de computer-use e prototipagem de agentes que evoluem.',
    whenNotToUse:
      'Evite em fluxos de produção críticos sem supervisão — agentes auto-evolutivos podem codificar atalhos errados. Trate como pesquisa, não como automação pronta.',
    targetUsers: ['Pesquisadores de IA', 'Devs de agentes', 'Entusiastas de computer-use', 'Times de automação'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'IA aplicada'],
    tags: ['Computer Use', 'Vision', 'Memória', 'Self-Evolving', 'Skills', 'Automação'],
  },
  {
    rank: 5,
    name: 'Zerostack',
    repo: 'https://github.com/gi-dellav/zerostack',
    title: 'Zerostack: o coding agent em Rust obcecado por consumo de memória',
    pitch:
      'A maioria dos coding agents são processos Python inchados que devoram RAM antes de escrever a primeira linha de código. Zerostack é o oposto. Um coding agent minimalista escrito em Rust, construído em torno de uma obsessão só: footprint de memória e performance. Sem runtime pesado, sem dependências desnecessárias. Só um agente enxuto que lê seu codebase, chama seu LLM e sai do caminho.',
    whenToUse:
      'Use quando quer um coding agent leve para rodar em máquina modesta, container apertado ou CI, sem o peso de runtimes Python. Bom para quem prioriza performance e baixo overhead.',
    whenNotToUse:
      'Evite se você depende de um ecossistema enorme de plugins Python — um agente minimalista entrega menos integrações prontas em troca da leveza.',
    targetUsers: ['Devs Rust', 'Quem roda agentes em CI', 'Entusiastas de performance', 'Devs com hardware modesto'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Rust', 'Coding Agent', 'Performance', 'Low Memory', 'LLM', 'CLI'],
  },
  {
    rank: 6,
    name: 'Terax',
    repo: 'https://github.com/crynta/terax-ai',
    title: 'Terax: um terminal de 7 MB com IA embutida que nunca liga pra casa',
    pitch:
      'Seu terminal tem uma IA embutida que lê seu código, escreve diffs, roda agentes e nunca liga para casa. Isso é o Terax. São 7 megabytes. Backend em Rust, frontend em React, funciona com OpenAI, Anthropic, Groq ou um modelo totalmente local via LM Studio. Terminal multi-aba, explorador de arquivos, editor de código com modo Vim — tudo em uma janela. Sem conta. Sem telemetria. Suas chaves de API vão direto para o keychain do sistema.',
    whenToUse:
      'Use quando quer um terminal moderno com IA integrada e privacidade real — chaves no keychain, zero telemetria, opção de modelo local. Bom para quem quer IA no terminal sem mandar dado pra nuvem de terceiros.',
    whenNotToUse:
      'Evite se já tem um setup de terminal altamente customizado e estável — migrar para um app integrado pode quebrar workflows e plugins existentes.',
    targetUsers: ['Devs preocupados com privacidade', 'Usuários de terminal', 'Fãs de modelos locais', 'Devs full-stack'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['Rust', 'React', 'Terminal', 'LM Studio', 'Local AI', 'Privacidade'],
  },
  {
    rank: 7,
    name: 'OpenSquilla',
    repo: 'https://github.com/OpenSquilla/opensquilla',
    title: 'OpenSquilla: o agente de IA open source obcecado por eficiência de token',
    pitch:
      'Todo agente de código hoje queima token como se não houvesse amanhã, e sua conta de API no fim do mês prova. OpenSquilla é um agente de IA open source desenhado para eficiência de token, extraindo mais inteligência por dólar do mesmo orçamento. Gestão de contexto mais inteligente, prompts mais enxutos, mais saída útil por chamada. Se você roda agentes em escala e o custo está matando seu runway, esse vale o olhar.',
    whenToUse:
      'Use quando roda agentes em escala e o custo de token virou problema de runway. Bom para times que precisam de mais resultado por dólar sem trocar de modelo.',
    whenNotToUse:
      'Evite assumir que eficiência de token resolve tudo — para tarefas que exigem contexto amplo, cortar agressivo pode degradar a qualidade. Meça antes de adotar.',
    targetUsers: ['Times rodando agentes em escala', 'Founders com runway apertado', 'Engenheiros de plataforma de IA', 'Devs custo-conscientes'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'IA aplicada'],
    tags: ['Coding Agent', 'Token Efficiency', 'Custo', 'Open Source', 'LLM', 'Context'],
  },
  {
    rank: 8,
    name: 'OpenPets',
    repo: 'https://github.com/alvinunreal/openpets',
    title: 'OpenPets: um bichinho de desktop que mostra o que seu agente de IA está fazendo',
    pitch:
      'Você deixa o Claude Code rodando por duas horas e não tem ideia se ele está trabalhando ou travado. OpenPets é um pet de desktop que vive na sua tela e reflete em tempo real o que seu coding agent está fazendo. Conecte o Claude Code via MCP, instale o pet que quiser e veja ele reagir conforme o agente coda, pensa ou fica ocioso. A estética de desktop buddy dos anos 90 encontra o workflow moderno de IA.',
    whenToUse:
      'Use quando roda agentes longos e quer um sinal ambiente, glanceável, do estado deles sem ficar abrindo o terminal. Bom para quem multitarefa enquanto o agente trabalha.',
    whenNotToUse:
      'Evite em ambiente de trabalho que exige sobriedade visual ou em telas compartilhadas — o pet é deliberadamente lúdico e pode distrair.',
    targetUsers: ['Usuários de Claude Code', 'Devs que multitarefam', 'Entusiastas de IA', 'Fãs de desktop buddies'],
    projectType: 'developer-tool',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['MCP', 'Claude Code', 'Desktop', 'UX', 'Status', 'Diversão'],
  },
  {
    rank: 9,
    name: 'Lance',
    repo: 'https://github.com/bytedance/Lance',
    title: 'Lance: a ByteDance abriu um modelo de 3B que entende E gera imagem e vídeo',
    pitch:
      'A maioria dos modelos multimodais ou entende visual ou gera visual. A ByteDance abriu o código do Lance, um único modelo de 3 bilhões de parâmetros que faz os dois, mais edição, em imagens e vídeo. Ele tira a maior nota no VBench entre todos os modelos unificados, batendo o Show-o2 de 7B com menos da metade dos parâmetros. Uma arquitetura dual-stream com mistura de especialistas mantém os caminhos de entendimento e geração separados sem dividir em modelos diferentes.',
    whenToUse:
      'Use em pesquisa e produtos que precisam de entendimento e geração visual no mesmo modelo, com footprint pequeno. Bom para times explorando multimodal unificado eficiente.',
    whenNotToUse:
      'Evite assumir qualidade de modelo gigante — 3B é eficiente, mas para geração de altíssima fidelidade modelos maiores ainda lideram. Avalie no seu caso de uso.',
    targetUsers: ['Pesquisadores multimodais', 'Devs de produto IA', 'Engenheiros de ML', 'Times de visão computacional'],
    projectType: 'data-ai',
    categories: ['IA aplicada', 'Pesquisa'],
    tags: ['Multimodal', 'ByteDance', 'Visão', 'Vídeo', 'MoE', 'Open Source'],
  },
  {
    rank: 10,
    name: 'DroidDesk',
    repo: 'https://github.com/orailnoor/DroidDesk',
    title: 'DroidDesk: transforma seu Android num desktop Linux de verdade com dois scripts',
    pitch:
      'Seu celular Android roda um chip ARM potente que passa a maior parte do tempo mostrando notificação. DroidDesk o transforma em um desktop Linux de verdade com dois shell scripts, Termux, Termux X11 e Proot. Acesso direto ao kernel, sem emulação. Pluga num monitor e roda VS Code, LibreOffice, Blender ou um modelo de IA local. Desconecta e todo o seu setup vem junto. Uma workstation Linux completa que cabe no bolso.',
    whenToUse:
      'Use quando quer uma workstation Linux portátil aproveitando o hardware do celular — desenvolvimento leve, escritório, experimentos. Bom para quem viaja ou tem um Android sobrando potente.',
    whenNotToUse:
      'Evite para cargas pesadas de produção — térmica, RAM e armazenamento do celular limitam. Trate como setup secundário ou de emergência, não como máquina principal.',
    targetUsers: ['Devs móveis', 'Entusiastas de Linux', 'Quem precisa de setup portátil', 'Hackers de hardware'],
    projectType: 'infra',
    categories: ['Infra', 'Ferramentas dev'],
    tags: ['Android', 'Linux', 'Termux', 'Proot', 'Portátil', 'ARM'],
  },
  {
    rank: 11,
    name: 'SmallCode',
    repo: 'https://github.com/Doorman11991/smallcode',
    title: 'SmallCode: 87% no SWE-bench com um modelo de 4B que roda na sua máquina',
    pitch:
      'Claude Code e Cursor assumem que você roda um modelo de fronteira com orçamento de contexto infinito. SmallCode assume que não. É um coding agent feito especificamente para LLMs pequenos, batendo 87% no SWE-bench com um modelo de 4 bilhões de parâmetros ativos. Desenhado para extrair máxima performance de código dos modelos que de fato rodam localmente no seu hardware. Se você leva a sério desenvolvimento de IA local, esse merece radar.',
    whenToUse:
      'Use quando quer um coding agent que performa bem com modelos pequenos e locais — privacidade, custo zero de API, offline. Bom para quem desenvolve IA local de verdade.',
    whenNotToUse:
      'Evite esperar a sofisticação de um agente de fronteira em tarefas muito complexas — modelos pequenos têm teto. Valide nas suas tarefas reais antes de migrar.',
    targetUsers: ['Devs de IA local', 'Quem prioriza privacidade', 'Devs offline', 'Entusiastas de LLMs pequenos'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'IA aplicada'],
    tags: ['SWE-bench', 'Local AI', 'Small LLM', 'Coding Agent', '4B', 'Open Source'],
  },
  {
    rank: 12,
    name: 'agents-best-practices',
    repo: 'https://github.com/DenisSergeevitch/agents-best-practices',
    title: 'agents-best-practices: prompts que funcionam igual no Codex e no Claude Code',
    pitch:
      'Prompts de Codex que funcionam ótimo quebram de repente quando você cola no Claude Code, e vice-versa. agents-best-practices nasceu para acabar com isso. É uma Agent Skill provider-neutral que cobre padrões de design de harness que funcionam em Codex, Claude Code e outros coding agents. Um conjunto de práticas, uma forma compartilhada de pensar prompts, tools e contexto, independente do modelo do outro lado.',
    whenToUse:
      'Use quando seu time usa mais de um coding agent e cansou de manter prompts duplicados por provedor. Bom para padronizar prática de harness em time multi-ferramenta.',
    whenNotToUse:
      'Evite tratar como verdade absoluta — cada modelo tem peculiaridades, e generalizar demais pode deixar dinheiro na mesa em otimizações específicas de provedor.',
    targetUsers: ['Times multi-agente', 'Engenheiros de prompt', 'Tech leads', 'Devs Codex e Claude Code'],
    projectType: 'developer-tool',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Agent Skills', 'Codex', 'Claude Code', 'Prompts', 'Harness', 'Best Practices'],
  },
  {
    rank: 13,
    name: 'Zero (zerolang)',
    repo: 'https://github.com/vercel-labs/zerolang',
    title: 'Zero: a Vercel criou uma linguagem de sistemas feita pra agentes de IA',
    pitch:
      'Agentes de IA escrevem código agora, mas ainda usam linguagens feitas para humanos. A Vercel lançou o Zero. É uma linguagem de sistemas desenhada explicitamente para agentes de IA. Em vez de imprimir erros de console normais, o compilador cospe JSON estruturado para o agente saber exatamente como corrigir os próprios bugs. Sinceramente não dá pra saber se dar aos bots a própria linguagem de programação é genial ou aterrorizante.',
    whenToUse:
      'Use para experimentar com fluxos onde o agente é o autor primário do código e o loop de correção máquina-a-máquina importa. Bom para pesquisa de agentic coding e tooling experimental.',
    whenNotToUse:
      'Evite em produção séria por enquanto — é uma linguagem nova, experimental, da Vercel Labs. Ecossistema, bibliotecas e estabilidade ainda estão se formando.',
    targetUsers: ['Pesquisadores de agentic coding', 'Devs de linguagem', 'Entusiastas de IA', 'Early adopters'],
    projectType: 'developer-tool',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Vercel', 'Linguagem', 'Compilador', 'JSON Errors', 'Agentic', 'Experimental'],
  },
  {
    rank: 14,
    name: 'files-sdk',
    repo: 'https://github.com/haydenbleasel/files-sdk',
    title: 'files-sdk: uma API só pra S3, R2, Vercel Blob e Supabase',
    pitch:
      'Toda vez que você troca de S3 para Cloudflare R2 ou Vercel Blob, reescreve seu código de storage do zero. files-sdk acaba com isso. Um SDK TypeScript unificado com uma API única e honesta que funciona em S3, R2, Vercel Blob, Supabase e mais. I/O baseado em web standards, tree-shakeable, zero lock-in. Escreva sua lógica de upload e download uma vez, troque o backend no config.',
    whenToUse:
      'Use quando quer abstrair o provedor de storage e manter liberdade de trocar sem reescrever código. Bom para produtos que podem migrar de provedor ou suportar múltiplos.',
    whenNotToUse:
      'Evite se você depende de recursos muito específicos de um provedor — uma camada de abstração tende ao denominador comum e pode não expor features avançadas.',
    targetUsers: ['Devs TypeScript', 'Times full-stack', 'Founders de SaaS', 'Devs que evitam lock-in'],
    projectType: 'backend',
    categories: ['Backend', 'Ferramentas dev'],
    tags: ['TypeScript', 'S3', 'R2', 'Vercel Blob', 'Supabase', 'Storage'],
  },
  {
    rank: 15,
    name: 'Concord',
    repo: 'https://github.com/chojs23/concord',
    title: 'Concord: o Discord inteiro no terminal usando 20 MB de RAM',
    pitch:
      'O Discord come 800 megabytes de RAM só para mostrar mensagens de texto. Concord roda a coisa toda no seu terminal usando de 20 a 40 megabytes. Feito em Rust, é um cliente Discord completo com servidores, canais, threads, DMs, enquetes, reações e preview de imagem inline usando os protocolos gráficos do Kitty ou iTerm2. Navegação estilo Vim, busca fuzzy de canais, paste de arquivo para upload e notificações de desktop.',
    whenToUse:
      'Use quando vive no terminal e quer Discord leve, com navegação por teclado, sem o peso do app Electron. Bom para devs que priorizam RAM e teclado.',
    whenNotToUse:
      'Evite se você usa recursos pesados de voz, vídeo ou stream do Discord — um cliente de terminal foca em texto e mídia leve, não em chamadas.',
    targetUsers: ['Devs que vivem no terminal', 'Usuários de Vim', 'Entusiastas de TUI', 'Quem prioriza RAM'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'Infra'],
    tags: ['Rust', 'TUI', 'Discord', 'Terminal', 'Kitty', 'Vim'],
  },
  {
    rank: 16,
    name: 'Autopreso',
    repo: 'https://github.com/kunchenguid/autopreso',
    title: 'Autopreso: fala e os slides aparecem sozinhos enquanto você explica',
    pitch:
      'Autopreso transcreve sua fala em tempo real e gera slides ou rascunhos de quadro-branco conforme você fala. Diga a coisa, veja o diagrama aparecer. Sem ficar mexendo no Keynote, sem parar para desenhar. Entrevistas técnicas, sessões de brainstorm, qualquer reunião onde pensar em voz alta é mais rápido do que preparar slides. O quadro-branco que se desenha sozinho.',
    whenToUse:
      'Use em entrevistas técnicas, brainstorms e reuniões onde explicar falando é mais rápido que preparar material. Bom para quem pensa em voz alta e quer apoio visual instantâneo.',
    whenNotToUse:
      'Evite para apresentações de alta produção que exigem layout preciso — geração automática é ótima para rascunho, não para deck final de cliente.',
    targetUsers: ['Quem dá entrevistas técnicas', 'Facilitadores de brainstorm', 'Educadores', 'PMs'],
    projectType: 'llm-app',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['Speech to Text', 'Slides', 'Whiteboard', 'Tempo Real', 'Apresentação', 'Diagramas'],
  },
  {
    rank: 17,
    name: 'Maya',
    repo: 'https://github.com/ronaldo-avalos/Maya',
    title: 'Maya: transforma o screen recording do iPhone em trailer de lançamento',
    pitch:
      'Você terminou seu app, gravou uma demo, e agora parece só uma captura de tela crua do iPhone. Maya faz parecer um trailer de lançamento. Envolva suas gravações de iPhone em uma moldura de device limpa, adicione momentos de zoom cinematográfico para destacar o que importa e exporte vídeos prontos para postar na App Store, Twitter ou Product Hunt. Open source, sem marca d’água, sem assinatura. A camada de polimento que faltava nas demos do seu app indie.',
    whenToUse:
      'Use quando precisa transformar gravação crua de iPhone em demo polida para App Store, redes ou Product Hunt. Bom para devs indie que não querem editor de vídeo caro.',
    whenNotToUse:
      'Evite se sua demo precisa de edição de vídeo avançada — Maya foca em moldura de device e zoom, não substitui um editor completo.',
    targetUsers: ['Devs iOS indie', 'Founders solo', 'Makers', 'Quem lança no Product Hunt'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'Design'],
    tags: ['iOS', 'Vídeo', 'Demo', 'App Store', 'Open Source', 'Marketing'],
  },
  {
    rank: 18,
    name: 'Rig',
    repo: 'https://github.com/backnotprop/rig',
    title: 'Rig: organiza o caos de rodar vários coding agents no Ghostty',
    pitch:
      'Se você vive dentro do Ghostty e roda vários coding agents ao mesmo tempo, seu layout de janelas vira caos em minutos. Rig é um pequeno sidecar de macOS para o Ghostty que deixa engenheiros criar, focar, organizar e acompanhar sessões de terminal entre projetos e harnesses de coding. Ele controla janelas reais do Ghostty via AppleScript e as APIs de Acessibilidade do macOS, então é o terminal nativo de verdade, não um fake.',
    whenToUse:
      'Use quando roda múltiplos coding agents no Ghostty e precisa de ordem entre sessões e projetos. Bom para engenheiros que orquestram vários agentes em paralelo no macOS.',
    whenNotToUse:
      'Evite se não usa Ghostty no macOS — Rig é específico para esse terminal e essa plataforma, depende de AppleScript e Acessibilidade.',
    targetUsers: ['Usuários de Ghostty', 'Devs macOS', 'Quem roda multi-agente', 'Power users de terminal'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'Agentes de IA'],
    tags: ['Ghostty', 'macOS', 'Terminal', 'AppleScript', 'Multi-Agente', 'Sessões'],
  },
  {
    rank: 19,
    name: 'auto-identity-remove',
    repo: 'https://github.com/stephenlthorn/auto-identity-remove',
    title: 'auto-identity-remove: tira seus dados de 30+ data brokers no automático',
    pitch:
      'Sair de data brokers manualmente significa preencher o mesmo formulário em 30 sites diferentes, a cada poucos meses, para sempre. Auto-identity-remove roda Playwright contra mais de 30 sites de people-search em agenda mensal, envia seus pedidos de opt-out automaticamente e loga tudo. Self-host em qualquer máquina ou no GitHub Actions, roda totalmente de graça. Seus dados pessoais removidos no silêncio, em piloto automático.',
    whenToUse:
      'Use quando quer remover sua presença de sites de people-search de forma recorrente sem trabalho manual. Bom para quem leva privacidade a sério e quer automação self-hosted.',
    whenNotToUse:
      'Evite assumir cobertura total — brokers mudam formulário e surgem novos. Trate como redução contínua de exposição, não como apagamento garantido. Confira o que cada site exige.',
    targetUsers: ['Quem se preocupa com privacidade', 'Profissionais expostos', 'Devs que self-hostam', 'Pessoas públicas'],
    projectType: 'automation',
    categories: ['Segurança', 'Ferramentas dev'],
    tags: ['Playwright', 'Privacidade', 'Opt-out', 'GitHub Actions', 'Automação', 'Self-Hosted'],
  },
  {
    rank: 20,
    name: 'LUKSbox',
    repo: 'https://github.com/PentHertz/LUKSbox',
    title: 'LUKSbox: container criptografado que você joga em qualquer nuvem sem confiar nela',
    pitch:
      'Guardar arquivos sensíveis no Dropbox ou Google Drive significa confiar a criptografia ao host. LUKSbox é um container criptografado em Rust que monta como um drive de verdade em Linux, macOS e Windows. Destrave com passphrase, chave de hardware FIDO2, TPM 2.0, Windows Hello ou keyslots híbridos pós-quânticos usando ML-KEM-768 e 1024. Coloque o container em qualquer drive de nuvem sem precisar confiar em quem o opera.',
    whenToUse:
      'Use quando quer criptografia que você controla por cima de qualquer storage de nuvem, com opções modernas de chave (FIDO2, TPM, pós-quântico). Bom para dados sensíveis em nuvem de terceiros.',
    whenNotToUse:
      'Evite sem entender gestão de chave e backup — perder o keyslot significa perder os dados. Cripto é poderosa e implacável; teste recuperação antes de confiar dados reais.',
    targetUsers: ['Quem se preocupa com privacidade', 'Engenheiros de segurança', 'Devs Rust', 'Quem guarda dado sensível na nuvem'],
    projectType: 'security',
    categories: ['Segurança', 'Infra'],
    tags: ['Rust', 'Criptografia', 'FIDO2', 'TPM', 'Pós-Quântico', 'LUKS'],
  },
  {
    rank: 21,
    name: 'Codiff',
    repo: 'https://github.com/nkzw-tech/codiff',
    title: 'Codiff: visualizador de diff local feito pra revisar código gerado por IA',
    pitch:
      'Codiff é um visualizador de diff local e rápido que roda no desktop, feito especificamente para revisar código gerado por IA sem apertar os olhos na saída do terminal. O modo de walkthrough com LLM é o recurso prático: percorra o diff, colete seus comentários de revisão, cole de volta no Claude e os ajustes são aplicados direto. Sem troca de contexto, sem copia-e-cola entre ferramentas.',
    whenToUse:
      'Use quando revisa muito código gerado por IA e quer um loop fluido de comentar e reaplicar via LLM. Bom para devs que vivem em PRs de coding agents.',
    whenNotToUse:
      'Evite tratar como substituto de revisão humana criteriosa — visualizar bem o diff não garante que você pegou o bug. A ferramenta acelera, não decide por você.',
    targetUsers: ['Devs que usam coding agents', 'Revisores de código', 'Tech leads', 'Times de IA aplicada'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'IA aplicada'],
    tags: ['Diff', 'Code Review', 'Claude', 'Desktop', 'LLM', 'Local'],
  },
  {
    rank: 22,
    name: 'Comptime',
    repo: 'https://github.com/lukeed/comptime',
    title: 'Comptime: roda código JavaScript em build time e inlina o resultado no bundle',
    pitch:
      'Já quis que o JavaScript rodasse código em build time em vez de mandar para o navegador? Comptime torna isso real. É um primitivo de avaliação em build-time inspirado no Zig, exposto como plugins para Vite e Rolldown. Envolva qualquer expressão e ela é avaliada durante o build, e o resultado é inlinado no bundle. Encolha sua saída, mate custo de runtime e mova trabalho caro para o tempo de compilação.',
    whenToUse:
      'Use quando quer mover computação cara do runtime para o build e enxugar o bundle — tabelas, constantes derivadas, dados pré-processados. Bom para quem otimiza performance de frontend.',
    whenNotToUse:
      'Evite avaliar em build-time o que depende de dados de runtime ou requisição — só serve para o que é conhecido na hora da compilação.',
    targetUsers: ['Devs frontend', 'Engenheiros de performance', 'Devs Vite', 'Autores de libs'],
    projectType: 'developer-tool',
    categories: ['Frontend', 'Ferramentas dev'],
    tags: ['JavaScript', 'Vite', 'Rolldown', 'Build Time', 'Bundle', 'Performance'],
  },
  {
    rank: 23,
    name: 'pgGraph',
    repo: 'https://github.com/Evokoa/pgGraph',
    title: 'pgGraph: dá superpoderes de banco de grafos ao seu Postgres existente',
    pitch:
      'Você escolheu Postgres para seu app, e um ano depois percebe que metade das suas queries são travessias de relacionamento que seriam muito mais rápidas em um banco de grafos. pgGraph resolve isso sem te fazer migrar nada. Ele adiciona superpoderes de banco de grafos direto em cima dos seus dados Postgres existentes. Rode queries de grafo contra as tabelas que você já tem, sem cluster Neo4j separado para operar, sem escrita dupla, sem pipeline de sincronização.',
    whenToUse:
      'Use quando suas queries no Postgres são pesadas em travessia de relacionamento e você não quer operar um banco de grafos separado. Bom para evitar a complexidade de Neo4j mantendo a fonte única.',
    whenNotToUse:
      'Evite para cargas de grafo extremas e especializadas onde um banco de grafos dedicado entrega performance que nenhuma extensão de Postgres alcança. Avalie o gargalo real.',
    targetUsers: ['Devs backend', 'Engenheiros de dados', 'Times Postgres', 'Quem evita Neo4j separado'],
    projectType: 'backend',
    categories: ['Backend', 'IA aplicada'],
    tags: ['Postgres', 'Grafo', 'SQL', 'Banco de Dados', 'Relacionamentos', 'Open Source'],
  },
  {
    rank: 24,
    name: 'Slopless',
    repo: 'https://github.com/seochecks-ai/slopless',
    title: 'Slopless: detecta "slop" de IA em Markdown com 50+ regras e custo zero de API',
    pitch:
      'Docs em Markdown gerados por IA são minuciosos e nunca lidos. Slopless é uma CLI TypeScript que audita arquivos Markdown usando mais de 50 regras determinísticas de textlint, pegando buzzwords surradas, transições forçadas e cadência robótica a custo zero de API. Gera JSON estruturado, então conecta limpo em pipelines de CI/CD ou direto em agentes de escrita como o Claude Code. Seu agente escreve um rascunho, o slopless audita, o agente reescreve até passar. Detecção de slop automatizada que não custa nada por rodada.',
    whenToUse:
      'Use para manter qualidade de texto gerado por IA em CI ou em loop com um agente de escrita. Bom para times que produzem docs em volume e querem um filtro determinístico e barato.',
    whenNotToUse:
      'Evite confiar que passar nas regras significa texto bom — regras determinísticas pegam padrões, não julgam ideia ou precisão técnica. Revisão humana ainda decide.',
    targetUsers: ['Tech writers', 'Devs que docam com IA', 'Times de conteúdo', 'Engenheiros de CI/CD'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'IA aplicada'],
    tags: ['TypeScript', 'Markdown', 'textlint', 'CI/CD', 'Claude Code', 'Qualidade'],
  },
  {
    rank: 25,
    name: 'claude-p',
    repo: 'https://github.com/smithersai/claude-p',
    title: 'claude-p: saída pipeada do Claude Code sem perder a TUI interativa',
    pitch:
      'A flag -p do Claude Code te dá saída pipeada, mas mata a TUI interativa no processo. claude-p resolve dirigindo a TUI interativa completa do Claude Code dentro de uma sessão PTY zmux in-process, e então capturando e fazendo stream da saída de forma limpa. Mesmo comando, mesmas flags, mesma memória muscular. Saída pipeada scriptável com o agente interativo completo rodando por baixo.',
    whenToUse:
      'Use quando precisa scriptar a saída do Claude Code mas quer o agente interativo completo por baixo, não a versão reduzida. Bom para automação e integração que dependem do comportamento da TUI.',
    whenNotToUse:
      'Evite se a flag -p simples já atende seu caso — a camada de PTY adiciona complexidade que só compensa quando você precisa do comportamento interativo completo.',
    targetUsers: ['Usuários de Claude Code', 'Engenheiros de automação', 'Devs de tooling', 'Times de IA aplicada'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'Agentes de IA'],
    tags: ['Claude Code', 'PTY', 'zmux', 'CLI', 'Automação', 'TUI'],
  },
  {
    rank: 26,
    name: 'Elephant Agent',
    repo: 'https://github.com/agentic-in/elephant-agent',
    title: 'Elephant Agent: memória de IA que constrói um modelo vivo de quem você é',
    pitch:
      'A maioria dos sistemas de memória de IA é um banco vetorial entupido de transcrições cruas. Barulhento, inchado, e mesmo assim não sabe quem você é. Elephant Agent faz diferente. Uma arquitetura Personal-Model First que constrói um modelo vivo de você, seus relacionamentos, seu ambiente, suas preferências. Depois de cada conversa, ele reflete em background e refina o mapa interno da sua vida, então o julgamento dele fica mais afiado com o tempo.',
    whenToUse:
      'Use quando quer um agente que de fato acumula contexto pessoal estruturado em vez de só recuperar transcrições. Bom para assistentes pessoais que precisam de julgamento que melhora com o uso.',
    whenNotToUse:
      'Evite sem pensar em privacidade — um modelo vivo da sua vida é dado altamente sensível. Entenda onde ele é armazenado e quem acessa antes de alimentar com dado real.',
    targetUsers: ['Power users de IA', 'Devs de assistentes', 'Pesquisadores de memória', 'Entusiastas de agentes pessoais'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'IA aplicada'],
    tags: ['Memória', 'Personal Model', 'Agente Pessoal', 'Contexto', 'LLM', 'Reflexão'],
  },
  {
    rank: 27,
    name: 'Ymawky',
    repo: 'https://github.com/imtomt/ymawky',
    title: 'Ymawky: servidor HTTP em assembly ARM64 puro que faz 1,2 milhão de req/s',
    pitch:
      'Ymawky é um servidor web HTTP estático totalmente funcional escrito inteiramente em assembly ARM64 puro para macOS. Sem bibliotecas externas, sem libc, syscalls Darwin cruas direto para o Apple Silicon. GET, PUT, DELETE, requisições byte-range, páginas de erro custom, listagem de diretório, mitigação de Slowloris. Binário de 48 kilobytes. Mais de 1,2 milhão de requisições por segundo num M3 mal tocando na RAM. Tecnicamente impressionante. Existencialmente motivado. Absolutamente insano.',
    whenToUse:
      'Use como estudo de caso de performance extrema e programação em assembly no Apple Silicon. Bom para quem quer entender syscalls Darwin, otimização de baixo nível e os limites do hardware.',
    whenNotToUse:
      'Evite em produção real — é uma demonstração de virtuosismo, não um servidor de propósito geral mantido. Para servir arquivos de verdade, use ferramentas testadas em batalha.',
    targetUsers: ['Devs de baixo nível', 'Entusiastas de performance', 'Curiosos de assembly', 'Devs Apple Silicon'],
    projectType: 'backend',
    categories: ['Backend', 'Infra'],
    tags: ['Assembly', 'ARM64', 'macOS', 'HTTP', 'Performance', 'Apple Silicon'],
  },
  {
    rank: 28,
    name: 'WhiteDNS',
    repo: 'https://github.com/iampedii/WhiteDNS',
    title: 'WhiteDNS: contrabandeia seu tráfego por DNS quando bloqueiam a internet',
    pitch:
      'Quando o governo desliga a internet, VPNs comuns são bloqueadas primeiro. WhiteDNS toma um caminho diferente. É um cliente Android de tunelamento DNS que contrabandeia seu tráfego através de queries DNS, o único protocolo que firewalls geralmente não conseguem matar. Dois modos: proxy SOCKS5 ou uma VPN de sistema completa usando o VpnService do Android com bibliotecas nativas tun2proxy.',
    whenToUse:
      'Use em contextos de censura severa onde VPNs tradicionais são bloqueadas e o DNS ainda passa. Bom para jornalistas, ativistas e quem precisa de conectividade resiliente sob bloqueio.',
    whenNotToUse:
      'Evite para uso geral de alta banda — tunelamento DNS é lento e detectável por redes mais sofisticadas. É ferramenta de último recurso, não substituto de VPN normal no dia a dia.',
    targetUsers: ['Jornalistas', 'Ativistas', 'Quem vive sob censura', 'Engenheiros de rede'],
    projectType: 'security',
    categories: ['Segurança', 'Infra'],
    tags: ['Android', 'DNS Tunneling', 'VPN', 'SOCKS5', 'Censura', 'tun2proxy'],
  },
  {
    rank: 29,
    name: 'Pi-DS4',
    repo: 'https://github.com/mitsuhiko/pi-ds4',
    title: 'Pi-DS4: roda o DeepSeek V4 Flash local no Metal do Apple Silicon via Pi',
    pitch:
      'Pi é a plataforma de coding agent do Armin Ronacher. DS4 é o motor de inferência pure-Metal do antirez para o DeepSeek V4 Flash. Pi-DS4 é a ponte entre os dois. Instale uma extensão de provider do Pi e você ganha um modelo DeepSeek V4 Flash local registrado como ds4 deepseek-v4-flash, rodando inteiramente no Metal do Apple Silicon. O servidor sobe sob demanda, o modelo baixa automaticamente, e um watchdog desliga quando não sobra cliente.',
    whenToUse:
      'Use quando quer rodar o DeepSeek V4 Flash localmente no Apple Silicon, integrado ao Pi, sem depender de API externa. Bom para devs Mac que querem modelo local forte no fluxo de coding agent.',
    whenNotToUse:
      'Evite se não usa Pi nem Apple Silicon — o projeto é a cola específica entre esses dois mundos. Em outro stack, não se aplica.',
    targetUsers: ['Usuários de Pi', 'Devs Apple Silicon', 'Fãs de modelos locais', 'Entusiastas de DeepSeek'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'Infra'],
    tags: ['DeepSeek', 'Metal', 'Apple Silicon', 'Pi', 'Local AI', 'Inferência'],
  },
  {
    rank: 30,
    name: 'Comimi',
    repo: 'https://github.com/yui540/comimi',
    title: 'Comimi: leitor de quadrinhos e mangá pronto pra plugar no seu app web',
    pitch:
      'Quer entregar um leitor de quadrinhos ou mangá dentro do seu app web sem reinventar navegação de páginas, zoom e gestos do zero? Comimi é uma biblioteca open source de leitor de quadrinhos para JavaScript e TypeScript. Plugue em qualquer projeto web, aponte para seus assets de imagem e ganhe uma experiência de leitura de verdade com todo o trabalho pesado já resolvido.',
    whenToUse:
      'Use quando precisa embutir leitura de quadrinhos ou mangá num app web sem construir o leitor inteiro. Bom para plataformas de conteúdo, portfólios e produtos editoriais.',
    whenNotToUse:
      'Evite se sua necessidade de leitura é trivial — para mostrar uma sequência simples de imagens, uma lib completa de leitor pode ser overkill.',
    targetUsers: ['Devs frontend', 'Devs de plataformas de conteúdo', 'Criadores de quadrinhos', 'Times de produto editorial'],
    projectType: 'frontend',
    categories: ['Frontend', 'Ferramentas dev'],
    tags: ['JavaScript', 'TypeScript', 'Comic Reader', 'Mangá', 'UI', 'Library'],
  },
  {
    rank: 31,
    name: 'gepa-viz',
    repo: 'https://github.com/modaic-ai/gepa-viz',
    title: 'gepa-viz: vê a árvore de evolução de prompt do GEPA crescer ao vivo',
    pitch:
      'GEPA é o otimizador reflexivo de prompt do DSPy que bate aprendizado por reforço com 35 vezes menos rollouts. Mas acompanhar o trabalho dele tem sido uma parede de arquivos de log até agora. gepa-viz é um visualizador interativo ao vivo para rodadas de GEPA. Veja a árvore de evolução de prompt crescer em tempo real, observe a fronteira de Pareto mudar e inspecione o feedback em linguagem natural que dirige cada mutação.',
    whenToUse:
      'Use quando roda GEPA e quer entender o processo de otimização em vez de garimpar logs. Bom para pesquisadores e engenheiros que afinam prompts com DSPy.',
    whenNotToUse:
      'Evite se você não usa GEPA nem DSPy — a ferramenta é específica desse ecossistema de otimização de prompt.',
    targetUsers: ['Engenheiros de prompt', 'Pesquisadores DSPy', 'Times de ML', 'Quem otimiza LLM'],
    projectType: 'data-ai',
    categories: ['IA aplicada', 'Ferramentas dev'],
    tags: ['GEPA', 'DSPy', 'Prompt Optimization', 'Visualização', 'Pareto', 'LLM'],
  },
  {
    rank: 32,
    name: 'gsd-pi',
    repo: 'https://github.com/open-gsd/gsd-pi',
    title: 'gsd-pi: mantém o agente no rumo em rodadas autônomas longas',
    pitch:
      'Rode qualquer coding agent por mais de uma hora e veja ele esquecer aos poucos o que estava construindo. gsd-pi foi feito especificamente para corrigir isso. Um sistema de meta-prompting, engenharia de contexto e desenvolvimento orientado a spec que mantém agentes no rumo em rodadas autônomas longas. Em vez de deixar seu agente improvisar até o caos, você dá a ele uma spec estruturada e uma disciplina de contexto que segura, hora após hora.',
    whenToUse:
      'Use quando roda agentes em tarefas longas e autônomas e o desvio de contexto vira problema. Bom para times que fazem desenvolvimento orientado a spec com coding agents.',
    whenNotToUse:
      'Evite para tarefas curtas e bem delimitadas — a estrutura de spec e disciplina de contexto adiciona overhead que só compensa em rodadas longas.',
    targetUsers: ['Devs de coding agents', 'Times de desenvolvimento orientado a spec', 'Engenheiros de prompt', 'Tech leads'],
    projectType: 'ai-agent',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Meta-Prompting', 'Context Engineering', 'Spec-Driven', 'Coding Agent', 'Autônomo', 'LLM'],
  },
  {
    rank: 33,
    name: 'ai-memory',
    repo: 'https://github.com/akitaonrails/ai-memory',
    title: 'ai-memory: memória de longo prazo que sobrevive à troca de Claude Code pra Cursor',
    pitch:
      'Trocar do Claude Code para o Cursor no meio do projeto normalmente significa re-explicar tudo do zero. ai-memory resolve isso. É uma camada de memória de longo prazo para CLIs de coding com IA que sobrevive entre vendors. O contexto do seu projeto, as decisões e o histórico ficam num único store compartilhado, e qualquer agente pega exatamente de onde o último parou. Acabou o lock-in por perda de memória.',
    whenToUse:
      'Use quando seu time alterna entre coding agents e quer preservar contexto, decisões e histórico entre eles. Bom para evitar lock-in e re-explicação a cada troca de ferramenta.',
    whenNotToUse:
      'Evite assumir que memória compartilhada substitui boa documentação — ela ajuda agentes, mas decisões importantes ainda merecem registro humano legível.',
    targetUsers: ['Times multi-agente', 'Devs que trocam de CLI', 'Tech leads', 'Quem evita lock-in'],
    projectType: 'developer-tool',
    categories: ['Agentes de IA', 'Ferramentas dev'],
    tags: ['Memória', 'Claude Code', 'Cursor', 'Contexto', 'CLI', 'Anti-Lock-in'],
  },
  {
    rank: 34,
    name: 'Codeindex',
    repo: 'https://github.com/scheidydude/codeindex',
    title: 'Codeindex: mostra o raio de explosão antes do agente mexer num arquivo',
    pitch:
      'Agentes de IA reescrevem funções com confiança e nenhuma consciência do que depende delas. Codeindex é um analisador de dependências de repositório com pontuação de raio de explosão (blast-radius) feito especificamente para desenvolvimento assistido por IA. Antes do seu agente tocar num arquivo, ele sabe exatamente o que mais vai quebrar. A pontuação de blast radius torna agentes pobres de contexto mais seguros e te dá um mapa claro de quais arquivos do codebase são genuinamente load-bearing.',
    whenToUse:
      'Use quando deixa agentes editarem código e quer reduzir o risco de mudanças que quebram dependências invisíveis. Bom para tornar agentes mais seguros e mapear arquivos críticos.',
    whenNotToUse:
      'Evite confiar só no score para liberar mudança — blast radius indica risco estrutural, não correção lógica. Testes ainda decidem se a mudança funciona.',
    targetUsers: ['Devs que usam coding agents', 'Tech leads', 'Engenheiros de plataforma', 'Times com codebase grande'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'Agentes de IA'],
    tags: ['Dependências', 'Blast Radius', 'Análise de Código', 'Coding Agent', 'Segurança', 'Refactor'],
  },
  {
    rank: 35,
    name: 'md2html',
    repo: 'https://github.com/haidang1810/md2html',
    title: 'md2html: converte Markdown longo em HTML que as pessoas de fato abrem',
    pitch:
      'Docs Markdown gerados por IA são minuciosos e não lidos. Md2html é uma skill portátil para Claude Code, Codex e Antigravity que converte Markdown long-form em páginas HTML self-contained que as pessoas de fato abrem. Diagramas Mermaid, timelines, callouts, sumário, suporte multilíngue, tudo já embutido. Sem build step, sem gerador de site estático, um arquivo HTML só que você publica em qualquer lugar.',
    whenToUse:
      'Use quando quer transformar docs Markdown densos em HTML autossuficiente e apresentável sem montar um gerador de site. Bom para relatórios, handoffs e docs que precisam circular.',
    whenNotToUse:
      'Evite para um site de documentação grande e versionado — aí um gerador de site estático de verdade dá mais estrutura, busca e navegação.',
    targetUsers: ['Devs que docam com IA', 'Tech writers', 'Usuários de Claude Code e Codex', 'Times que circulam relatórios'],
    projectType: 'developer-tool',
    categories: ['Ferramentas dev', 'IA aplicada'],
    tags: ['Markdown', 'HTML', 'Claude Code', 'Codex', 'Mermaid', 'Docs'],
  },
]

async function fetchGithubMeta(owner: string, repo: string): Promise<GithubRepoMeta | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bitflix-open-source-batch-dev-tools-2026-05',
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
  const now = new Date().toISOString()
  const existing = await findOneBySlug(payload, 'articles', slug)
  const publishedAt = (existing as Article | null)?.published_at ?? now
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
    published_at: publishedAt,
    is_active: true,
    created_via: 'manual',
  }

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
      'Lote curado pela Bitflix com foco em dev tools, coding agents, CLIs, infra e seguranca. Articles publicados direto (sem etapa de revisao no admin), parity weekly-31.',
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
    console.log(`✓ ${seed.rank}. ${seed.name} -> /blog/${article.slug} (published)`)
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
