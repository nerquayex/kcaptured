'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  themes?: Theme[]
}

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  themes: Theme[]
  systemTheme?: 'light' | 'dark'
}

const defaultThemes: Theme[] = ['light', 'dark', 'system']
const STORAGE_KEY = 'theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const getSystemTheme = () =>
  window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light'

const applyTheme = (
  theme: Theme,
  attribute: string,
  themes: Theme[],
  enableColorScheme: boolean,
) => {
  const element = document.documentElement
  const systemTheme = getSystemTheme()
  const resolved = theme === 'system' ? systemTheme : theme

  if (attribute === 'class') {
    element.classList.remove(...themes.filter((t) => t !== 'system'))
    element.classList.add(resolved)
  } else {
    element.setAttribute(attribute, resolved)
  }

  if (enableColorScheme) {
    element.style.colorScheme = resolved
  }
}

const getSavedTheme = (storageKey: string, defaultTheme: Theme) => {
  if (typeof window === 'undefined') return defaultTheme

  try {
    const stored = localStorage.getItem(storageKey) as Theme | null
    return stored ?? defaultTheme
  } catch {
    return defaultTheme
  }
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  enableColorScheme = true,
  storageKey = STORAGE_KEY,
  themes = defaultThemes,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>(
    typeof window === 'undefined' ? 'light' : getSystemTheme(),
  )

  React.useEffect(() => {
    const savedTheme = getSavedTheme(storageKey, defaultTheme)
    setThemeState(savedTheme)
    applyTheme(savedTheme, attribute, themes, enableColorScheme)
    setMounted(true)

    if (enableSystem) {
      const media = window.matchMedia(COLOR_SCHEME_QUERY)
      const handleMediaChange = () => {
        const newSystemTheme = getSystemTheme()
        setSystemTheme(newSystemTheme)
        if (savedTheme === 'system') {
          applyTheme('system', attribute, themes, enableColorScheme)
        }
      }
      media.addEventListener('change', handleMediaChange)

      return () => media.removeEventListener('change', handleMediaChange)
    }
  }, [attribute, defaultTheme, enableColorScheme, enableSystem, storageKey, themes])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      try {
        localStorage.setItem(storageKey, nextTheme)
      } catch {
        // Ignore storage errors
      }
      applyTheme(nextTheme, attribute, themes, enableColorScheme)
      if (enableSystem && nextTheme === 'system') {
        setSystemTheme(getSystemTheme())
      }
    },
    [attribute, enableColorScheme, enableSystem, storageKey, themes],
  )

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    themes: enableSystem ? themes : themes.filter((t) => t !== 'system'),
    systemTheme: enableSystem ? systemTheme : undefined,
  }

  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
