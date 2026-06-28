import { useEffect, useRef, useState, useCallback } from 'react'
import './ShuffleText.css'

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export default function ShuffleText({ text = '', className = '', shuffleSpeed = 80, revealDuration = 2000 }) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(true)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const startTimeRef = useRef(null)

  const shuffle = useCallback(() => {
    const textArr = text.split('')
    const result = textArr.map((char, i) => {
      if (char === ' ') return ' '
      const elapsed = Date.now() - startTimeRef.current
      const charDelay = (i / textArr.length) * revealDuration * 0.3
      if (elapsed > charDelay + revealDuration * 0.7) {
        return char
      }
      return CHARS[Math.floor(Math.random() * CHARS.length)]
    })
    setDisplayText(result.join(''))
  }, [text, revealDuration])

  useEffect(() => {
    startTimeRef.current = Date.now()
    setIsAnimating(true)
    setDisplayText(text)

    intervalRef.current = setInterval(shuffle, shuffleSpeed)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setDisplayText(text)
      setIsAnimating(false)
    }, revealDuration + text.length * 30)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [text, shuffleSpeed, revealDuration, shuffle])

  return (
    <span className={`shuffle-text ${className} ${isAnimating ? 'shuffling' : ''}`}>
      {displayText}
    </span>
  )
}
