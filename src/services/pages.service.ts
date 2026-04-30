import { getPayload } from '@/lib/payload'
import {
  toHomePageVM,
  toProdutosPageVM,
  toServicosPageVM,
  toSobrePageVM,
  toContatoPageVM,
  type HomePageVM,
  type ProdutosPageVM,
  type ServicosPageVM,
  type SobrePageVM,
  type ContatoPageVM,
} from '@/dto/pages'

export async function getHomePage(): Promise<HomePageVM> {
  const payload = await getPayload()
  const data = await payload.findGlobal({ slug: 'home-page', depth: 0 })
  return toHomePageVM(data)
}

export async function getProdutosPage(): Promise<ProdutosPageVM> {
  const payload = await getPayload()
  const data = await payload.findGlobal({ slug: 'produtos-page', depth: 0 })
  return toProdutosPageVM(data)
}

export async function getServicosPage(): Promise<ServicosPageVM> {
  const payload = await getPayload()
  const data = await payload.findGlobal({ slug: 'servicos-page', depth: 0 })
  return toServicosPageVM(data)
}

export async function getSobrePage(): Promise<SobrePageVM> {
  const payload = await getPayload()
  const data = await payload.findGlobal({ slug: 'sobre-page', depth: 0 })
  return toSobrePageVM(data)
}

export async function getContatoPage(): Promise<ContatoPageVM> {
  const payload = await getPayload()
  const data = await payload.findGlobal({ slug: 'contato-page', depth: 0 })
  return toContatoPageVM(data)
}
