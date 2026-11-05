export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export interface VerificationPageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ consulta?: string | string[] }>
}
