/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark') // Default to dark mode

  useEffect(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem('kamioi_theme')
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'cloud']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    setTheme(newTheme)
    localStorage.setItem('kamioi_theme', newTheme)
  }

  const value = {
    theme,
    isDarkMode: theme === 'dark',
    isBlackMode: theme === 'dark', // Keep for backward compatibility
    isLightMode: theme === 'light',
    isCloudMode: theme === 'cloud',
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}


