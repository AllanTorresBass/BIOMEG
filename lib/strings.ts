/**
 * Every UI string lives here. Spanish text the laboratory gave is at the top level.
 * Anything the laboratory has not given sits under `pendingReview` so it can be checked.
 */
export const strings = {
  brand: {
    name: 'BIOMEG',
    descriptor: 'LABORATORIO CLINICO',
    logoAlt: 'BIOMEG Laboratorio Clínico',
    rifUnconfirmed: 'RIF sin confirmar',
  },
  empty: {
    dash: '—',
    pending: 'Pendiente',
    noPrice: 'SIN PRECIO',
  },
  fixed: {
    unopenedReport: 'Las columnas de este reporte no están capturadas.',
  },
  age: {
    years: (n: number) => (n === 1 ? '1 año' : `${n} años`),
    months: (n: number) => (n === 1 ? '1 mes' : `${n} meses`),
  },
  pendingReview: {
    home: {
      title: 'Laboratorio Clínico',
      note: 'Fundación en construcción. Todavía no hay pantallas de trabajo.',
    },
    dev: {
      tokensTitle: 'Tokens y componentes base',
      tokensNote: 'Página de revisión. No aparece en la navegación ni en producción.',
      colors: 'Colores',
      chips: 'Chips de estado',
      type: 'Tipografía',
      formats: 'Formatos',
      demoResults: 'Resultados de muestra',
      demoPrices: 'Precios de muestra',
      withoutColor: 'Sin color',
      staffSurface: 'Pantalla del personal',
      portalSurface: 'Portal',
    },
  },
} as const
