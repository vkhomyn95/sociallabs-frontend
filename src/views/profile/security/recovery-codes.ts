const FILE_NAME = 'sociallabs-recovery-codes.txt'

export function copyRecoveryCodes(codes: readonly string[]): Promise<void> {
  return navigator.clipboard.writeText(codes.join('\n'))
}

export function downloadRecoveryCodes(codes: readonly string[]): void {
  const blob = new Blob([`SocialLabs recovery codes\n\n${codes.join('\n')}\n`], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: FILE_NAME })
  link.click()
  URL.revokeObjectURL(url)
}
