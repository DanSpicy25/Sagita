import { useState, useEffect } from 'react'

export type PlatformOS = 'ios' | 'android' | 'desktop'

export function detectDeviceOS(): PlatformOS {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent || navigator.vendor || ''

  // Detección de dispositivos iOS (iPhone, iPad, iPod o Safari en macOS touch)
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }

  // Detección de dispositivos Android
  if (/android/i.test(ua)) {
    return 'android'
  }

  return 'desktop'
}

export function useDeviceOS() {
  const [detectedOS, setDetectedOS] = useState<PlatformOS>('desktop')
  const [manualOS, setManualOS] = useState<'auto' | 'ios' | 'android'>('auto')

  useEffect(() => {
    const os = detectDeviceOS()
    setDetectedOS(os)

    const saved = localStorage.getItem('sagitta_preferred_os')
    if (saved === 'ios' || saved === 'android') {
      setManualOS(saved)
    }
  }, [])

  const setOS = (os: 'auto' | 'ios' | 'android') => {
    setManualOS(os)
    if (os === 'auto') {
      localStorage.removeItem('sagitta_preferred_os')
    } else {
      localStorage.setItem('sagitta_preferred_os', os)
    }
  }

  // Sistema operativo activo para aplicar los estilos de interfaz
  const activeOS: 'ios' | 'android' =
    manualOS === 'auto'
      ? detectedOS === 'android'
        ? 'android'
        : 'ios' // por defecto iOS en desktop/Apple
      : manualOS

  const isNativeMobile = detectedOS === 'ios' || detectedOS === 'android'

  return {
    detectedOS,
    activeOS,
    manualOS,
    setOS,
    isNativeMobile,
  }
}

