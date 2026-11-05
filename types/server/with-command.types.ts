export interface EndpointOptions {
  /** Requests per minute from one address. */
  perMinute?: number
  /** Status for an accepted command. 201 when it creates a record. */
  status?: 200 | 201
  /** Staff is the default, so a new endpoint can't be left open by accident. */
  audience?: 'staff' | 'public'
}
