// Звуки в стилі 8-біт/Minecraft, синтезовані через Web Audio (без файлів).
// AudioContext створюється при першому дотику — інакше iOS його блокує.
let ctx: AudioContext | null = null
const MUTE_KEY = 'quest-muted'

export const isMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
}
export const setMuted = (m: boolean) => {
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0') } catch { /* ignore */ }
}

function ac(): AudioContext | null {
  if (isMuted()) return null
  try {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext }
    const Ctor = window.AudioContext ?? W.webkitAudioContext
    if (!Ctor) return null
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol = 0.15, endFreq?: number) {
  const c = ac(); if (!c) return
  const t0 = c.currentTime + start
  const o = c.createOscillator(); const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur)
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(c.destination)
  o.start(t0); o.stop(t0 + dur + 0.02)
}

// клік по стрілці — короткий "пунь"
export const sfxTick = () => tone(520 + Math.random() * 60, 0, 0.06, 'square', 0.1, 380)
// натиснули кнопку
export const sfxPress = () => { tone(300, 0, 0.08, 'square', 0.12, 200) }
// неправильний код — низький "бзз/уф"
export const sfxError = () => {
  tone(180, 0, 0.28, 'sawtooth', 0.18, 70)
  tone(130, 0.05, 0.3, 'square', 0.1, 60)
  try { navigator.vibrate?.(180) } catch { /* ignore */ }
}
// правильний код — як орб досвіду / level up
export const sfxSuccess = () => {
  ;[659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.09, 0.18, 'triangle', 0.18))
  tone(1976, 0.36, 0.3, 'sine', 0.08)
}
// фінал — фанфари
export const sfxFinale = () => {
  const seq: [number, number][] = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.5], [1047, 0.62], [1319, 0.76], [1568, 0.95]]
  seq.forEach(([f, t]) => tone(f, t, 0.3, 'square', 0.12))
  ;[262, 330, 392].forEach((f) => tone(f, 0.95, 0.9, 'triangle', 0.15))
}
