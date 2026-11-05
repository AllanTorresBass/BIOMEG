export interface MenuItem {
  label: string
  /** The command is shown when the role may reach any of these. */
  commands: readonly string[]
  slug: string
}

export interface MenuGroup {
  label: string
  items: readonly MenuItem[]
}

export interface PrimaryAction {
  label: string
  commands: readonly string[]
  href: string
}
