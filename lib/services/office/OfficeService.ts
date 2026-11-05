import { BaseService } from '@/lib/services/base/BaseService'
import type { OfficeResult } from '@/types/office/office.types'
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

/** Named commands for prices, registries, users, and maintenance. None of them delete a record. */
export class OfficeService extends BaseService {
  constructor() {
    super('/api/v1/office')
  }

  setRate(input: SetRateInput): Promise<OfficeResult> {
    return this.post('/rate', input)
  }

  setSaturday(input: SwitchInput): Promise<OfficeResult> {
    return this.post('/saturday', input)
  }

  setQr(input: SwitchInput): Promise<OfficeResult> {
    return this.post('/qr', input)
  }

  editPrice(input: EditPriceInput): Promise<OfficeResult> {
    return this.post('/price', input)
  }

  increasePrices(input: IncreaseInput): Promise<OfficeResult> {
    return this.post('/increase', input)
  }

  printPrices(): Promise<OfficeResult> {
    return this.post('/price-print', {})
  }

  saveRegistry(input: RegistrySaveInput): Promise<OfficeResult> {
    return this.post('/registry', input)
  }

  deductInventory(input: InventoryInput): Promise<OfficeResult> {
    return this.post('/inventory', input)
  }

  createUser(input: CreateUserInput): Promise<OfficeResult> {
    return this.post('/user', input)
  }

  disableUser(input: UserIdInput): Promise<OfficeResult> {
    return this.post('/user-disable', input)
  }

  changeRoles(input: ReplaceRolesInput): Promise<OfficeResult> {
    return this.post('/user-roles', input)
  }

  grantCover(input: CoverInput): Promise<OfficeResult> {
    return this.post('/user-cover', input)
  }

  grantBioanalista(input: GrantBioanalistaInput): Promise<OfficeResult> {
    return this.post('/user-license', input)
  }

  resetPassword(input: UserIdInput): Promise<OfficeResult> {
    return this.post('/user-reset', input)
  }

  saveMail(input: MailInput): Promise<OfficeResult> {
    return this.post('/mail', input)
  }

  runBackup(input: { confirmed?: boolean }): Promise<OfficeResult> {
    return this.post('/backup', input)
  }
}
