export interface GlobalErrorHandler {
  handleCrudError: (error: unknown) => void
  handleFetchError: (error: unknown) => void
}
