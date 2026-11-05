import Image from 'next/image'
import { paginate } from '@/lib/domain/report-layout'
import { strings } from '@/lib/strings'
import type { ReportDocument } from '@/types/orders/report.types'

const text = strings.report

function QrCode({ modules }: { modules: boolean[][] }) {
  const size = modules.length
  const path = modules
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : '')))
    .join('')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Código QR de verificación" className="size-24 shrink-0" shapeRendering="crispEdges">
      <path d={path} className="fill-paper-ink" />
    </svg>
  )
}

function Header({ doc, qr }: { doc: ReportDocument; qr: boolean[][] | null }) {
  const patient = doc.patient
  const fields: [string, string][] = [
    [text.labels.paciente, patient.paciente],
    [text.labels.cedula, patient.cedula],
    [text.labels.edad, patient.edad],
    [text.labels.genero, patient.genero],
    [text.labels.telefono, patient.telefono],
    [text.labels.convenio, patient.convenio],
    [text.labels.fechaMuestra, patient.fechaMuestra],
    [text.labels.fechaReporte, patient.fechaReporte],
    [text.labels.orden, patient.orden],
  ]
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Image src="/report-header.png" alt={doc.lab.name} width={744} height={327} className="h-auto w-48" priority />
          <p className="text-xs">RIF {doc.lab.rif}</p>
        </div>
        {qr ? (
          <div className="flex flex-col items-center gap-1">
            <QrCode modules={qr} />
            {doc.consultCode ? (
              <p className="text-center text-xs">
                {text.consultCode}
                <br />
                <span className="font-bold tabular-nums">{doc.consultCode}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {doc.draft ? (
        <p className="border-2 border-paper-ink px-3 py-1.5 text-sm">
          <span className="font-bold">{text.incomplete}</span>
          {doc.missing.length > 0 ? <span>{`  ${text.incompleteMissing(doc.missing.join(', '))}`}</span> : null}
        </p>
      ) : null}

      <dl className="grid gap-x-6 gap-y-0.5 text-sm sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-28 shrink-0 text-xs font-bold leading-5">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

function ColumnHeads() {
  return (
    <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1.4fr_0.5fr] gap-2 border-y-2 border-paper-ink py-1 text-xs font-bold">
      <span>{text.columns.exam}</span>
      <span>{text.columns.result}</span>
      <span>{text.columns.unit}</span>
      <span>{text.columns.reference}</span>
      <span>{text.columns.mark}</span>
    </div>
  )
}

/** The paper. A sheet per page, cut by the same rule the PDF uses. It stays white and black in every theme. */
export function ReportPaper({ doc, qr }: { doc: ReportDocument; qr: boolean[][] | null }) {
  const pages = paginate(doc.sections)
  return (
    <div className="flex flex-col items-center gap-6 print:gap-0">
      {pages.map((page, index) => (
        <article
          key={index}
          className="relative flex min-h-[1000px] w-full max-w-[794px] flex-col gap-4 overflow-hidden bg-paper p-10 text-paper-ink shadow-md print:min-h-0 print:break-after-page print:shadow-none"
          aria-label={text.page(index + 1, pages.length)}
        >
          {doc.draft ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex -rotate-45 items-center justify-center text-[8rem] font-black text-paper-rule/25"
            >
              {text.watermark}
            </span>
          ) : null}

          {index === 0 ? <Header doc={doc} qr={qr} /> : null}
          <ColumnHeads />

          <div className="relative flex flex-1 flex-col gap-3">
            {page.map((section) => (
              <section key={`${section.title}-${section.subsection ?? ''}`} className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">
                  {section.subsection ? `${section.title} - ${section.subsection}` : section.title}
                </h2>
                {section.rows.map((row) => (
                  <div
                    key={row.lineId}
                    className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1.4fr_0.5fr] gap-2 text-sm leading-5"
                  >
                    <span>{row.name}</span>
                    <span className="font-bold tabular-nums">{row.value}</span>
                    <span>{row.unit}</span>
                    <span className="text-xs leading-5">{row.reference}</span>
                    <span className="font-bold">{row.mark ?? ''}</span>
                  </div>
                ))}
              </section>
            ))}

            {index === pages.length - 1 && doc.processedBy.length > 0 ? (
              <div className="mt-4 flex flex-col gap-0.5 text-sm">
                {doc.processedBy.map((entry) => (
                  <p key={`${entry.section}-${entry.name}`}>
                    {text.processedBy}
                    {entry.section ? ` (${entry.section})` : ''}: {entry.name}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <footer className="flex items-center justify-between border-t border-paper-rule pt-2 text-xs">
            <span>{text.footer(doc.lab.rif)}</span>
            <span className="tabular-nums">{text.page(index + 1, pages.length)}</span>
          </footer>
        </article>
      ))}
    </div>
  )
}
