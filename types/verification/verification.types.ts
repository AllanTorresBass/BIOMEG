/** Built from an allow-list. No name, cédula, phone, exam, or value can reach the page. */
export type VerificationView =
  | { kind: 'NO_DISPONIBLE' }
  | {
      kind: 'ESTADO'
      orderNumber: string
      labName: string
      reportDateText: string
      state: 'LIBERADO' | 'INCOMPLETO' | 'EN_CORRECCION'
      valueCheck: boolean
    }
  | {
      kind: 'REEMPLAZADO'
      orderNumber: string
      labName: string
      reportDateText: string
      replacedDateText: string
    }

export interface VerificationFile {
  pdf: Buffer
  name: string
}
