/* eslint-disable no-console -- the one place that writes to the console. */
type Fields = Readonly<Record<string, unknown>>

const SENSITIVE_KEYS = /name|nombre|cedula|phone|telefono|birth|nacimiento|email|correo|result|value|valor|password|clave|token|code|codigo/i
const SENSITIVE_TEXT: readonly RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  /\b[VEJPG]-?\d[\d.]{4,}\b/gi,
  /\b0?4\d{2}[-\s]?\d{7}\b/g,
  /\b\d{2}\/\d{2}\/\d{4}\b/g,
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{5,}\b/g,
]
const REDACTED = '[redactado]'

function redactText(text: string): string {
  return SENSITIVE_TEXT.reduce((current, pattern) => current.replace(pattern, REDACTED), text)
}

/** Names, cédulas, phones, birth dates, emails, and result text never reach a log. */
export function redact(value: unknown, key = ''): unknown {
  if (key && SENSITIVE_KEYS.test(key)) return REDACTED
  if (typeof value === 'string') return redactText(value)
  if (value instanceof Error) return { type: value.name, message: redactText(value.message) }
  if (Array.isArray(value)) return value.map((entry) => redact(entry))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([name, entry]) => [name, redact(entry, name)]))
  }
  return value
}

function write(level: 'info' | 'warn' | 'error', message: string, fields?: Fields): void {
  if (level === 'info' && process.env.NODE_ENV === 'production') return
  console[level](redactText(message), fields ? redact(fields) : '')
}

export const logger = {
  info: (message: string, fields?: Fields): void => write('info', message, fields),
  warn: (message: string, fields?: Fields): void => write('warn', message, fields),
  error: (message: string, fields?: Fields): void => write('error', message, fields),
}
