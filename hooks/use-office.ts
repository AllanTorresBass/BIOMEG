'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type {
  CoverInput,
  CreateUserInput,
  EditPriceInput,
  GrantBioanalistaInput,
  IncreaseInput,
  InventoryInput,
  MailInput,
  RegistrySaveInput,
  ReplaceRolesInput,
  SetRateInput,
  SwitchInput,
  UserIdInput,
} from '@/types/office/office.schemas'

export function useOfficeCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.officeService
    return {
      setRate: (input: SetRateInput) => run(() => service().setRate(input)),
      setSaturday: (input: SwitchInput) => run(() => service().setSaturday(input)),
      setQr: (input: SwitchInput) => run(() => service().setQr(input)),
      editPrice: (input: EditPriceInput) => run(() => service().editPrice(input)),
      increasePrices: (input: IncreaseInput) => run(() => service().increasePrices(input)),
      printPrices: () => run(() => service().printPrices(), { toasts: 'failures' }),
      saveRegistry: (input: RegistrySaveInput) => run(() => service().saveRegistry(input)),
      deductInventory: (input: InventoryInput) => run(() => service().deductInventory(input)),
      createUser: (input: CreateUserInput) => run(() => service().createUser(input)),
      disableUser: (input: UserIdInput) => run(() => service().disableUser(input)),
      changeRoles: (input: ReplaceRolesInput) => run(() => service().changeRoles(input)),
      grantCover: (input: CoverInput) => run(() => service().grantCover(input)),
      grantBioanalista: (input: GrantBioanalistaInput) => run(() => service().grantBioanalista(input)),
      resetPassword: (input: UserIdInput) => run(() => service().resetPassword(input)),
      saveMail: (input: MailInput) => run(() => service().saveMail(input)),
      runBackup: () => run(() => service().runBackup({})),
    }
  }, [run])
}
