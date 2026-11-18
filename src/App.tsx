import { useEffect, useState } from 'react'
import CodeLock from './CodeLock'
import { QUEST, STEPS } from './quest'
import { isMuted, setMuted, sfxError, sfxFinale, sfxSuccess } from './sound'

const KEY = 'quest-progress-v2'
const TOTAL = STEPS.length

// Будь-який відомий код веде на свій рівень. Якщо прогрес загубився
// (наприклад, у вбудованому браузері Телеграма), вводимо код останньої записки.
const CODE_TO_STAGE: Record<string, number> = {
  [QUEST.startCode]: 1,
  ...Object.fromEntries(STEPS.map((st, i) => [st.code, i + 2])),
}

// stage: 0 = ввести стартовий код, 1..TOTAL = завдання, TOTAL+1 = фінал
function load(): number {
  try {
    const url = new URL(location.href)
    if (url.searchParams.has('reset')) {
      localStorage.removeItem(KEY)
      // прибираємо ?reset з адреси, щоб оновлення сторінки не скидало прогрес знову
      url.searchParams.delete('reset')
      history.replaceState(null, '', url.pathname + url.search + url.hash)
    }
    const raw = localStorage.getItem(KEY)
    if (raw === null) return 0
    const v = Number(raw)
    return Number.isInteger(v) && v >= 0 && v <= TOTAL + 1 ? v : 0
  } catch {
    return 0
  }
}

export default function App() {
  const [stage, setStage] = useState<number>(load)
  const [muted, setMute] = useState<boolean>(isMuted)

  useEffect(() => {
    try { localStorage.setItem(KEY, String(stage)) } catch { /* ignore */ }
    window.scrollTo(0, 0)
  }, [stage])

  const tryCode = (c: string): boolean => {
    const t = CODE_TO_STAGE[c]
    if (t !== undefined && t > stage) {
      setStage(t)
      setTimeout(t === TOTAL + 1 ? sfxFinale : sfxSuccess, 120)
      return true
    }
    sfxError()
    return false
  }

  const step = stage >= 1 && stage <= TOTAL ? STEPS[stage - 1] : null
  const pct = Math.round(((stage - 1) / TOTAL) * 100)

  return (
    <main className="screen">
      <button
        className="mc-btn mute"
        aria-label={muted ? 'увімкнути звук' : 'вимкнути звук'}
        onClick={() => { setMuted(!muted); setMute(!muted) }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <h1 className="logo">{QUEST.title}</h1>

      {step && (
        <div className="xp" aria-label="прогрес">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
          <span className="xp-num">{stage}/{TOTAL}</span>
        </div>
      )}

      <section className="panel">
        {stage === 0 && (
          <>
            <h2>Привіт, {QUEST.heroName}!</h2>
            <p>{QUEST.gateText}</p>
            <p className="sub">Вже грав і щось злетіло? Введи код із останньої знайденої записки — і продовжиш звідти.</p>
            <h3>Введи код:</h3>
            <CodeLock
              key="gate"
              label="ПОЧАТИ"
              onSubmit={tryCode}
            />
          </>
        )}

        {step && (
          <>
            {step.note && (
              <div className="note">
                <b>📜 Записка №{step.noteNo}</b>
                <p>{step.note}</p>
              </div>
            )}
            <h2>{step.title}</h2>
            {step.subtitle && <p className="sub">({step.subtitle})</p>}
            {step.text.map((t, i) => <p key={i}>{t}</p>)}
            <h3>Введи код із записки:</h3>
            <CodeLock
              key={stage}
              onSubmit={tryCode}
            />
          </>
        )}

        {stage === TOTAL + 1 && (
          <>
            <h2>🏆 ПЕРЕМОГА!</h2>
            <p>{QUEST.finale}</p>
          </>
        )}
      </section>
    </main>
  )
}
