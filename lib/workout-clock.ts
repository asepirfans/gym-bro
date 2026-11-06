export function elapsedSecondsSince(startedAt: string | number | Date, now = Date.now()) {
  const start = new Date(startedAt).getTime()
  return Number.isFinite(start) ? Math.max(0, Math.floor((now - start) / 1000)) : 0
}

export function remainingRestSeconds(endsAt: number, now = Date.now()) {
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}
