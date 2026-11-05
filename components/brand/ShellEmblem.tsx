import Image from 'next/image'

const MARK_SIZE = 40

/** Decorative: the shell shows the words BIOMEG and LABORATORIO CLINICO beside it. */
export function ShellEmblem() {
  return (
    <Image
      src="/logo-emblem-on-white.png"
      alt=""
      width={MARK_SIZE}
      height={MARK_SIZE}
      unoptimized
    />
  )
}
