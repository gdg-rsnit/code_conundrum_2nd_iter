import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Countdown.module.css'

function Countdown() {
  const [count, setCount] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.requestFullscreen?.()
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.()
    }
  }, [])

  useEffect(() => {
    if (count < 0) {
      navigate('/countdown-finished')
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, navigate])

  return (
    <div className={styles.screen}>
      <div className={styles.ring} />
      <span key={count} className={styles.number}>
        {count}
      </span>
    </div>
  )
}

export default Countdown
