/**
 * Container DI (Awilix CLASSIC). Stub — registros reais serão adicionados na Fase 2+
 * quando entrarem repositories, facades, use cases e providers.
 *
 * Convenção:
 *  - Repositories e Providers: singleton (LIFETIME.SINGLETON)
 *  - Facades e UseCases: transient (LIFETIME.TRANSIENT)
 *  - Modo CLASSIC (parâmetros do construtor inferidos pelos nomes registrados)
 */

// Tipos de cradle entram aqui conforme módulos são registrados (Fase 2+).
export type AppContainer = Record<string, never>

let container: AppContainer | null = null

export function getContainer(): AppContainer {
  if (!container) {
    container = {} as AppContainer
  }
  return container
}

export function resetContainer(): void {
  container = null
}
