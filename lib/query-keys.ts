export const queryKeys = {
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (text: string, includeInactive: boolean) => [...queryKeys.clients.lists(), text, includeInactive] as const,
  },
  worklist: {
    all: ['worklist'] as const,
    lists: () => [...queryKeys.worklist.all, 'list'] as const,
    list: (date: string, reviewOnly: boolean) => [...queryKeys.worklist.lists(), date, reviewOnly] as const,
  },
}
