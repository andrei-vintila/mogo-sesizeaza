export function getInitials(fullName: string): string {
  const names = fullName.split(' ')

  if (names.length >= 2) {
    return `${names[0].charAt(0)} ${names[1].charAt(0)}`
  }
  else if (names.length === 1) {
    return `${names[0].charAt(0)}`
  }
  else {
    return 'Anonymous'
  }
}
