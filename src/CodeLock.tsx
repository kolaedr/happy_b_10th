import { useState } from 'react'

type Props = { onSubmit: (code: string) => boolean; label?: string }

// 4 крутилки як на сейфі: стрілки вгору/вниз + колесо миші
export default function CodeLock({ onSubmit, label = 'ВІДКРИТИ' }: Props) {
  const [digits, setDigits] = useState([0, 0, 0, 0])
  const [shake, setShake] = useState(false)

  const change = (i: number, d: number) =>
    setDigits((p) => p.map((v, k) => (k === i ? (v + d + 10) % 10 : v)))

  const submit = () => {
    const ok = onSubmit(digits.join(''))
    if (!ok) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div>
      <div className={`lock ${shake ? 'shake' : ''}`}>
        {digits.map((d, i) => (
          <div
            className="wheel"
            key={i}
            onWheel={(e) => change(i, e.deltaY > 0 ? -1 : 1)}
          >
            <button className="mc-btn arrow" onClick={() => change(i, 1)} aria-label="більше">▲</button>
            <div className="digit">{d}</div>
            <button className="mc-btn arrow" onClick={() => change(i, -1)} aria-label="менше">▼</button>
          </div>
        ))}
      </div>
      {shake && <p className="error">❌ Невірний код! Спробуй ще раз.</p>}
      <button className="mc-btn big green" onClick={submit}>{label}</button>
    </div>
  )
}
