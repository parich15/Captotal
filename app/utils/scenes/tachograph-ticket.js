import { ICONS } from './tachograph-lcd.js'

const pad = value => String(Math.floor(value)).padStart(2, '0')
export const formatDate = date => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
export const formatTime = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`
export const formatDuration = minutes => `${pad(minutes / 60)}h${pad(minutes % 60)}`

const LEVELS = { rest: 6, avail: 20, work: 34, drive: 50 }

// Tique impreso de 24 h en papel térmico; los datos son de muestra.
export function paintTicket(canvas, data) {
  const ctx = canvas.getContext('2d')
  const { width: W, height: H } = canvas
  ctx.fillStyle = '#fbfaf5'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(60, 50, 30, .025)'
  for (let i = 0; i < 2200; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5)
  const ink = '#24272b', left = 30
  let y = 60
  const icon = (name, x, baseline, scale = 3) => {
    ctx.fillStyle = ink
    ICONS[name]?.forEach((row, r) => { for (let c = 0; c < 7; c++) if (row[c] === '#') ctx.fillRect(x + c * scale, baseline - 7 * scale + r * scale, scale, scale) })
    return 7 * scale + 8
  }
  const write = (text, x = left, size = 25, weight = 600) => {
    ctx.font = `${weight} ${size}px "Courier New", Courier, monospace`
    ctx.fillStyle = ink
    for (const match of text.matchAll(/\{(\w+)\}|([^{]+)/g)) {
      if (match[1]) x += icon(match[1], x, y - 1)
      else { ctx.fillText(match[2], x, y); x += ctx.measureText(match[2]).width }
    }
  }
  const rule = () => {
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.setLineDash([9, 6])
    ctx.beginPath(); ctx.moveTo(left, y - 8); ctx.lineTo(W - left, y - 8); ctx.stroke(); ctx.setLineDash([])
    y += 30
  }
  const next = (gap = 36) => { y += gap }

  rule()
  write(`${formatDate(data.printed)} ${formatTime(data.printedUtc)} (UTC)`); next()
  rule()
  write(`24h {card} ${formatDate(data.printed)}`, left, 28, 700); next(40)
  rule()
  write('{card} CONDUCTOR/A: MUESTRA'); next()
  write('   E 0000000000000 1 0', left, 22, 500); next()
  write('{flag} E  VEHÍCULO 0000 CAP'); next(40)
  rule()

  // Gráfico de actividades de 00 a 24 h.
  const gx = left + 34, gw = W - left * 2 - 40, base = y + 80
  ctx.strokeStyle = ink; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(gx, base); ctx.lineTo(gx + gw, base); ctx.stroke()
  ctx.font = '500 16px "Courier New", Courier, monospace'
  for (let hour = 0; hour <= 24; hour += 2) {
    const x = gx + gw * hour / 24
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base + (hour % 6 ? 6 : 12)); ctx.stroke()
    if (hour % 6 === 0) ctx.fillText(pad(hour), x - 9, base + 30)
  }
  for (const [name, level] of Object.entries(LEVELS)) icon(name, left - 8, base - level + 9, 2)
  ctx.fillStyle = ink
  for (const segment of data.segments) {
    const x0 = gx + gw * segment.from / 1440, x1 = gx + gw * Math.min(segment.to, 1440) / 1440
    ctx.fillRect(x0, base - LEVELS[segment.activity], Math.max(1.5, x1 - x0), LEVELS[segment.activity])
  }
  y = base + 72
  rule()
  write(`{drive} ${formatDuration(data.totals.drive)}   {work} ${formatDuration(data.totals.work)}`); next()
  write(`{avail} ${formatDuration(data.totals.avail)}   {rest} ${formatDuration(data.totals.rest)}`); next(40)
  rule()
  write(`{drive} ${Math.round(data.distance)} km  ODO ${Math.round(data.odometer)}`, left, 22); next(40)
  rule()
  write('Firma del conductor:', left, 22, 500); next(58)
  ctx.strokeStyle = ink; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(left, y - 8); ctx.lineTo(W - left, y - 8); ctx.stroke(); ctx.setLineDash([])
  next(24)
  rule()
  write('Tique de ejemplo · formación CAP', left, 19, 500)
}
