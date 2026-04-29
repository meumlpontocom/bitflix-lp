/**
 * Formatadores BR centralizados. Não duplicar em componentes.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const BR_DATE = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const BR_TIME = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const formatBRL = (cents: number): string => BRL.format(cents / 100)

export const formatBRDate = (date: Date | string | number): string =>
  BR_DATE.format(new Date(date))

export const formatBRTime = (date: Date | string | number): string =>
  BR_TIME.format(new Date(date))

export const formatBRDateTime = (date: Date | string | number): string => {
  const d = new Date(date)
  return `${BR_DATE.format(d)} ${BR_TIME.format(d)}`
}
