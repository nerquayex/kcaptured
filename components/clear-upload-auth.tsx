'use client'

import { useEffect } from 'react'

const AUTH_TOKEN_KEY = 'uploadToken'
const AUTH_TOKEN_EXPIRY_KEY = 'uploadTokenExpiry'
const AUTH_ENTRY_KEY = 'uploadEntryAllowed'

export function ClearUploadAuth() {
  useEffect(() => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
    sessionStorage.removeItem(AUTH_ENTRY_KEY)
  }, [])

  return null
}
