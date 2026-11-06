export function localDateKey(value: Date | string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function calendarDays(year: number, month: number) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) =>
    index < offset || index >= offset + count ? null : new Date(year, month, index - offset + 1),
  )
}
