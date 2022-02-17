import { StrapiBase } from './base'

export interface IDocument extends StrapiBase {
  name: string
  document_items: IDocumentItem[]
  document_categories: IDocumentCategory[]
  slug: string
}

export interface IDocumentCategory extends StrapiBase {
  name: string
  document_items: IDocumentItem[]
  slug: string
}

export interface IDocumentItem extends StrapiBase {
  name: string
  content: string
}
