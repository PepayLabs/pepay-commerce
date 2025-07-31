import { useState, useEffect } from 'react'
import { Typography } from '@mui/material'

interface TypewriterTextProps {
  initialText: string
  className?: string
  sx?: any
}

export default function TypewriterText({ initialText, sx }: TypewriterTextProps) {
  const [currentText, setCurrentText] = useState(initialText)
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const phrases = [
    "PAYFI FOR AI AGENTS 🤖",
    "PAYFI WITH MCP ⚡", 
    "PAYFI IN GAMES 🎮",
    "PAYFI FOR ECOMMERCE 🛒",
    "PAYFI FOR CREATORS 👨‍💻",
    "PAYFI WITH STABLE YIELD 🔥"
  ]

  // Function to split text into grapheme clusters (handles emojis properly)
  const splitIntoGraphemes = (text: string): string[] => {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (seg) => seg.segment)
  }

  useEffect(() => {
    if (hasStarted) return

    // Wait 3 seconds before starting typewriter effect
    const initialDelay = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
      typewriterLoop()
    }, 2500)

    return () => clearTimeout(initialDelay)
  }, [hasStarted])

  const typewriterLoop = async () => {
    while (true) {
      await runSingleCycle()
      
      // Wait 20 seconds before starting the next cycle
      await new Promise(resolve => setTimeout(resolve, 20000))
    }
  }

  const runSingleCycle = async () => {
    const speed = 60
    const deleteSpeed = 60
    const nextStringDelay = 1200

    // Function to type text
    const typeText = (text: string): Promise<void> => {
      return new Promise((resolve) => {
        const graphemes = splitIntoGraphemes(text)
        let i = 0
        
        const typing = () => {
          if (i < graphemes.length) {
            const newText = graphemes.slice(0, i + 1).join('') + '|'
            setCurrentText(newText)
            i++
            setTimeout(typing, speed)
          } else {
            // Remove cursor and wait
            setCurrentText(text)
            setTimeout(() => resolve(), nextStringDelay)
          }
        }
        typing()
      })
    }

    // Function to delete text
    const deleteText = (text: string): Promise<void> => {
      return new Promise((resolve) => {
        const graphemes = splitIntoGraphemes(text)
        let i = graphemes.length
        
        const deleting = () => {
          if (i > 0) {
            const newText = graphemes.slice(0, i - 1).join('') + '|'
            setCurrentText(newText)
            i--
            setTimeout(deleting, deleteSpeed)
          } else {
            setCurrentText('|')
            setTimeout(() => resolve(), 100)
          }
        }
        deleting()
      })
    }

    // Type through all phrases once
    for (let i = 0; i < phrases.length; i++) {
      await typeText(phrases[i])
      
      // Don't delete the last phrase immediately
      if (i < phrases.length - 1) {
        await deleteText(phrases[i])
      }
    }

    // Delete the last phrase and return to original text
    await new Promise(resolve => setTimeout(resolve, nextStringDelay))
    await deleteText(phrases[phrases.length - 1])
    await typeText(initialText)
    setCurrentText(initialText) // Remove cursor
  }

  return (
    <Typography 
      variant="body1" 
      sx={{ 
        fontSize: { xs: '1.1rem', md: '1.35rem' },
        lineHeight: 1.5,
        color: '#5f6368',
        mb: 4,
        maxWidth: '90%',
        minHeight: '1.5em', // Prevent layout shift
        fontFamily: '"Google Sans Text", "Roboto", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        ...sx
      }}
    >
      {currentText}
    </Typography>
  )
}